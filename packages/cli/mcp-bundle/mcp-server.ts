import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as z from 'zod/v4';
import { loadLocalEnvFiles } from './env.js';
import { MCP_HOST_ENV_DIRS, type McpHostAuthContext } from './mcp-host-env.js';

type GeneratedTool = {
    toolName: string;
    title?: string;
    description: string;
};

type GeneratedRuntimeModule = {
    generatedTools: GeneratedTool[];
    resolveHostContext: () => McpHostAuthContext;
    invokeTool: (
        toolName: string,
        args?: Record<string, unknown>,
        hostContext?: McpHostAuthContext
    ) => Promise<unknown>;
    inputZodByTool?: Record<string, z.ZodTypeAny>;
    mcpServerName?: string;
    mcpServerVersion?: string;
};

function requireMcpServerIdentity(generated: GeneratedRuntimeModule): { name: string; version: string } {
    const name = generated.mcpServerName?.trim();
    const version = generated.mcpServerVersion?.trim();
    if (!name) {
        throw new Error('Generated module must export "mcpServerName". Regenerate tool code.');
    }
    if (!version) {
        throw new Error('Generated module must export "mcpServerVersion". Regenerate tool code.');
    }
    return { name, version };
}

function requireInputZodSchema(inputZodByTool: Record<string, z.ZodTypeAny> | undefined, toolName: string): z.ZodTypeAny {
    if (!inputZodByTool) {
        throw new Error('Generated module must export "inputZodByTool". Regenerate tool code.');
    }
    const schema = inputZodByTool[toolName];
    if (!schema) {
        throw new Error(
            `Generated module inputZodByTool has no schema for tool "${toolName}". Regenerate tool code.`
        );
    }
    return schema;
}

function asLocalModulePath(modulePath: string): string {
    if (modulePath.startsWith('file://')) {
        throw new Error('mcp-serve.mjs accepts local file paths only (no file:// URLs).');
    }
    return path.resolve(modulePath);
}

function readRuntimeModule(imported: Record<string, unknown>): GeneratedRuntimeModule {
    const generatedTools = imported.generatedTools;
    const invokeTool = imported.invokeTool;
    const resolveHostContext = imported.resolveHostContext;
    if (!Array.isArray(generatedTools)) {
        throw new Error('Generated module must export "generatedTools" array.');
    }
    if (typeof invokeTool !== 'function') {
        throw new Error('Generated module must export async "invokeTool" function.');
    }
    if (typeof resolveHostContext !== 'function') {
        throw new Error('Generated module must export "resolveHostContext". Regenerate tool code.');
    }
    const inputZodByTool = imported.inputZodByTool;
    const mcpServerName = imported.mcpServerName;
    const mcpServerVersion = imported.mcpServerVersion;
    return {
        generatedTools: generatedTools as GeneratedTool[],
        resolveHostContext: resolveHostContext as GeneratedRuntimeModule['resolveHostContext'],
        invokeTool: invokeTool as GeneratedRuntimeModule['invokeTool'],
        inputZodByTool:
            inputZodByTool && typeof inputZodByTool === 'object' && !Array.isArray(inputZodByTool)
                ? (inputZodByTool as Record<string, z.ZodTypeAny>)
                : undefined,
        mcpServerName: typeof mcpServerName === 'string' ? mcpServerName : undefined,
        mcpServerVersion: typeof mcpServerVersion === 'string' ? mcpServerVersion : undefined
    };
}

function reloadEnvFilesForDev(): void {
    const raw = process.env[MCP_HOST_ENV_DIRS];
    if (!raw?.trim()) {
        return;
    }
    try {
        const dirs = JSON.parse(raw) as unknown;
        if (Array.isArray(dirs) && dirs.every((d) => typeof d === 'string')) {
            loadLocalEnvFiles(dirs);
        }
    } catch {
        // ignore malformed config
    }
}

export async function runMcpServerFromImportedModule(imported: Record<string, unknown>): Promise<void> {
    const generated = readRuntimeModule(imported);
    const { name, version } = requireMcpServerIdentity(generated);
    const server = new McpServer({ name, version });

    for (const tool of generated.generatedTools) {
        const inputSchema = requireInputZodSchema(generated.inputZodByTool, tool.toolName);

        server.registerTool(
            tool.toolName,
            {
                title: typeof tool.title === 'string' && tool.title.length > 0 ? tool.title : undefined,
                description: tool.description,
                inputSchema
            },
            async (args) => {
                reloadEnvFilesForDev();
                const hostContext = generated.resolveHostContext();
                const result = await generated.invokeTool(
                    tool.toolName,
                    (args ?? {}) as Record<string, unknown>,
                    hostContext
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
        );
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

export async function runMcpServerFromGeneratedModule(modulePath: string): Promise<void> {
    const absolutePath = asLocalModulePath(modulePath);
    const imported = await import(pathToFileURL(absolutePath).href);
    if (!imported || typeof imported !== 'object') {
        throw new Error(`Generated module "${modulePath}" did not export an object.`);
    }
    await runMcpServerFromImportedModule(imported as Record<string, unknown>);
}
