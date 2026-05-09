import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as z from 'zod/v4';

type GeneratedTool = {
    toolName: string;
    description: string;
};

type GeneratedInvokeOptions = {
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    body?: unknown;
};

type GeneratedRuntimeModule = {
    generatedTools: GeneratedTool[];
    invokeTool: (toolName: string, options?: GeneratedInvokeOptions) => Promise<unknown>;
};

type RunMcpServerOptions = {
    reloadModulePerRequest?: boolean;
};

const generatedToolInputSchema = z.object({
    pathParams: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.unknown().optional()
});

function asLocalModulePath(modulePath: string): string {
    if (modulePath.startsWith('file://')) {
        throw new Error('mcp-serve-generated accepts local file paths only (no file:// URLs).');
    }
    return path.resolve(modulePath);
}

async function importGeneratedModule(modulePath: string): Promise<GeneratedRuntimeModule> {
    const absolutePath = asLocalModulePath(modulePath);
    const imported = await import(pathToFileURL(absolutePath).href);
    if (!imported || typeof imported !== 'object') {
        throw new Error(`Generated module "${modulePath}" did not export an object.`);
    }
    const generatedTools = (imported as { generatedTools?: unknown }).generatedTools;
    const invokeTool = (imported as { invokeTool?: unknown }).invokeTool;
    if (!Array.isArray(generatedTools)) {
        throw new Error(`Generated module "${modulePath}" must export "generatedTools" array.`);
    }
    if (typeof invokeTool !== 'function') {
        throw new Error(`Generated module "${modulePath}" must export async "invokeTool" function.`);
    }
    return {
        generatedTools: generatedTools as GeneratedTool[],
        invokeTool: invokeTool as GeneratedRuntimeModule['invokeTool']
    };
}

async function importGeneratedModuleWithoutCache(modulePath: string): Promise<GeneratedRuntimeModule> {
    const absolutePath = asLocalModulePath(modulePath);
    const moduleUrl = pathToFileURL(absolutePath);
    moduleUrl.searchParams.set('t', `${Date.now()}`);
    const imported = await import(moduleUrl.href);
    if (!imported || typeof imported !== 'object') {
        throw new Error(`Generated module "${modulePath}" did not export an object.`);
    }
    const generatedTools = (imported as { generatedTools?: unknown }).generatedTools;
    const invokeTool = (imported as { invokeTool?: unknown }).invokeTool;
    if (!Array.isArray(generatedTools)) {
        throw new Error(`Generated module "${modulePath}" must export "generatedTools" array.`);
    }
    if (typeof invokeTool !== 'function') {
        throw new Error(`Generated module "${modulePath}" must export async "invokeTool" function.`);
    }
    return {
        generatedTools: generatedTools as GeneratedTool[],
        invokeTool: invokeTool as GeneratedRuntimeModule['invokeTool']
    };
}

export async function runMcpServerFromGeneratedModule(modulePath: string, options: RunMcpServerOptions = {}): Promise<void> {
    const generated = await importGeneratedModule(modulePath);
    const loadModule = options.reloadModulePerRequest
        ? () => importGeneratedModuleWithoutCache(modulePath)
        : () => importGeneratedModule(modulePath);
    const server = new McpServer({
        name: 'api2ai-generated-tools',
        version: '0.1.0'
    });

    for (const tool of generated.generatedTools) {
        server.registerTool(
            tool.toolName,
            {
                description: tool.description,
                inputSchema: generatedToolInputSchema
            },
            async (args) => {
                const currentModule = await loadModule();
                const result = await currentModule.invokeTool(tool.toolName, {
                    pathParams: args.pathParams as GeneratedInvokeOptions['pathParams'],
                    query: args.query as GeneratedInvokeOptions['query'],
                    headers: args.headers as GeneratedInvokeOptions['headers'],
                    body: args.body
                });
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
