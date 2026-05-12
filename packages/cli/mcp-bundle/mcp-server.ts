import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as z from 'zod/v4';

type GeneratedTool = {
    toolName: string;
    /** Present on well-formed generated modules; absent or non-string must not crash MCP registration. */
    title?: string;
    description: string;
};

type GeneratedInvokeOptions = {
    baseUrl?: string;
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
    /** bearerSealed: base64 A2S1 blob from seal-bearer-helper (passed through to generated invokeTool). */
    sealedCredential?: string;
};

type GeneratedRuntimeModule = {
    generatedTools: GeneratedTool[];
    invokeTool: (toolName: string, options?: GeneratedInvokeOptions) => Promise<unknown>;
    inputSchemaByTool?: Record<string, unknown>;
};

type RunMcpServerOptions = {
    reloadModulePerRequest?: boolean;
};

const primitiveUnion = z.union([z.string(), z.number(), z.boolean()]);

/** JSON-schema `enum` arrays are resolved at runtime; avoid `z.enum()` which expects a literal tuple type in typings. */
function zodPicklist(strings: readonly string[]): z.ZodTypeAny {
    if (strings.length === 0) {
        return z.never();
    }
    if (strings.length === 1) {
        return z.literal(strings[0]!);
    }
    const literals = strings.map((v) => z.literal(v));
    return z.union(literals as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

/** Like `zodPicklist` for numeric `enum` on `type: number` / `type: integer` schemas. */
function zodNumericPicklist(values: readonly number[]): z.ZodTypeAny {
    if (values.length === 0) {
        return z.never();
    }
    if (values.length === 1) {
        return z.literal(values[0]!);
    }
    const literals = values.map((v) => z.literal(v));
    return z.union(literals as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
}

/** Maps JSON-schema-like objects emitted by codegen into Zod for MCP registerTool. */
function jsonSchemaToZod(schema: unknown): z.ZodTypeAny {
    if (schema === null || typeof schema !== 'object') {
        return z.unknown();
    }
    const s = schema as Record<string, unknown>;

    if (Array.isArray(s.anyOf)) {
        const parts = s.anyOf.map((p) => jsonSchemaToZod(p));
        if (parts.length === 0) {
            return z.never();
        }
        if (parts.length === 1) {
            return parts[0]!;
        }
        return z.union(parts as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
    }

    if (s.type === 'object' && s.properties !== undefined && typeof s.properties === 'object' && !Array.isArray(s.properties)) {
        const props = s.properties as Record<string, unknown>;
        const required = new Set(Array.isArray(s.required) ? (s.required as unknown[]).filter((x): x is string => typeof x === 'string') : []);
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const [key, propSchema] of Object.entries(props)) {
            let inner = jsonSchemaToZod(propSchema);
            if (!required.has(key)) {
                inner = inner.optional();
            }
            shape[key] = inner;
        }
        let obj = z.object(shape);
        if (s.additionalProperties === false) {
            obj = obj.strict();
        }
        return obj;
    }

    if (s.type === 'array') {
        const items = jsonSchemaToZod(s.items);
        return z.array(items);
    }

    if (s.type === 'string') {
        if (Array.isArray(s.enum) && s.enum.length >= 1 && s.enum.every((e) => typeof e === 'string')) {
            return zodPicklist(s.enum as string[]);
        }
        return z.string();
    }

    if (s.type === 'number' || s.type === 'integer') {
        if (Array.isArray(s.enum) && s.enum.length >= 1 && s.enum.every(isFiniteNumber)) {
            return zodNumericPicklist(s.enum);
        }
        return z.number();
    }

    if (s.type === 'boolean') {
        return z.boolean();
    }

    // Buckets with loose object + additionalProperties mapping
    if (s.type === 'object' && s.additionalProperties === true) {
        return z.record(z.string(), primitiveUnion);
    }

    if (s.type === 'object' && typeof s.additionalProperties === 'object' && s.additionalProperties !== null && !Array.isArray(s.additionalProperties)) {
        const valueType = jsonSchemaToZod(s.additionalProperties);
        return z.record(z.string(), valueType as z.ZodTypeAny);
    }

    return z.unknown();
}

const queryValueUnion = z.union([primitiveUnion, z.array(primitiveUnion)]);

const fallbackInputSchema = z.object({
    baseUrl: z.string().optional(),
    pathParams: z.record(z.string(), primitiveUnion).optional(),
    query: z.record(z.string(), queryValueUnion).optional(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.unknown().optional(),
    sealedCredential: z.string().optional()
});

function asLocalModulePath(modulePath: string): string {
    if (modulePath.startsWith('file://')) {
        throw new Error('mcp-serve.mjs accepts local file paths only (no file:// URLs).');
    }
    return path.resolve(modulePath);
}

function readRuntimeModule(imported: Record<string, unknown>): GeneratedRuntimeModule {
    const generatedTools = imported.generatedTools;
    const invokeTool = imported.invokeTool;
    if (!Array.isArray(generatedTools)) {
        throw new Error('Generated module must export "generatedTools" array.');
    }
    if (typeof invokeTool !== 'function') {
        throw new Error('Generated module must export async "invokeTool" function.');
    }
    const inputSchemaByTool = imported.inputSchemaByTool;
    return {
        generatedTools: generatedTools as GeneratedTool[],
        invokeTool: invokeTool as GeneratedRuntimeModule['invokeTool'],
        inputSchemaByTool:
            inputSchemaByTool && typeof inputSchemaByTool === 'object' && !Array.isArray(inputSchemaByTool)
                ? (inputSchemaByTool as Record<string, unknown>)
                : undefined
    };
}

async function importGeneratedModule(modulePath: string): Promise<GeneratedRuntimeModule> {
    const absolutePath = asLocalModulePath(modulePath);
    const imported = await import(pathToFileURL(absolutePath).href);
    if (!imported || typeof imported !== 'object') {
        throw new Error(`Generated module "${modulePath}" did not export an object.`);
    }
    return readRuntimeModule(imported as Record<string, unknown>);
}

async function importGeneratedModuleWithoutCache(modulePath: string): Promise<GeneratedRuntimeModule> {
    const absolutePath = asLocalModulePath(modulePath);
    const moduleUrl = pathToFileURL(absolutePath);
    moduleUrl.searchParams.set('t', `${Date.now()}`);
    const imported = await import(moduleUrl.href);
    if (!imported || typeof imported !== 'object') {
        throw new Error(`Generated module "${modulePath}" did not export an object.`);
    }
    return readRuntimeModule(imported as Record<string, unknown>);
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
        const rawSchema = generated.inputSchemaByTool?.[tool.toolName];
        const inputSchema = rawSchema !== undefined ? jsonSchemaToZod(rawSchema) : fallbackInputSchema;

        server.registerTool(
            tool.toolName,
            {
                title: typeof tool.title === 'string' && tool.title.length > 0 ? tool.title : undefined,
                description: tool.description,
                inputSchema
            },
            async (args) => {
                const a = args as GeneratedInvokeOptions;
                const currentModule = await loadModule();
                const result = await currentModule.invokeTool(tool.toolName, {
                    baseUrl: a.baseUrl,
                    pathParams: a.pathParams,
                    query: a.query,
                    headers: a.headers,
                    body: a.body,
                    sealedCredential: a.sealedCredential
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
