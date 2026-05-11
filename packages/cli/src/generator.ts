import type { Model, Operation } from 'api-2-ai-dsl-language';
import { expandToNode, toString } from 'langium/generate';
import type { LoadedOpenApi } from 'api-2-ai-dsl-language';
import { loadOpenApi, makeOperationLookupKey } from 'api-2-ai-dsl-language';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { extractDestinationAndName } from './util.js';
import {
    buildMcpDescription,
    buildMcpTitle,
    buildQueryParamSerializationLookup,
    buildToolInputSchema,
    type JsonSchemaDict
} from './openapi-tool-codegen.js';

export type GeneratedOutputFiles = {
    tsPath: string;
    jsPath: string;
    mcpServePath: string;
};

declare const __dirname: string | undefined;

function bundleSafeGeneratorImplementationDir(): string {
    const cjsBundleDir = typeof __dirname !== 'undefined' ? __dirname : '';
    if (cjsBundleDir.length > 0) {
        return cjsBundleDir;
    }
    return url.fileURLToPath(new URL('.', import.meta.url));
}

const __generatorDirname = bundleSafeGeneratorImplementationDir();

/** When shipped inside the VS Code extension bundle, spawn sets this to its embed folder (includes package.json + resources/). */
function resolveEmbedHomeDirectory(): string | undefined {
    const raw = process.env.API2AI_EMBED_HOME?.trim();
    return raw ? path.resolve(raw) : undefined;
}

/** Directory for `generated/cli` next to `generated/tools` or sibling under `generated/`. */
function resolveGeneratedCliDir(destinationTsPath: string): string {
    const dir = path.dirname(path.resolve(destinationTsPath));
    return path.basename(dir) === 'tools' ? path.join(path.dirname(dir), 'cli') : path.join(dir, 'cli');
}

/** NPM bootstrap root: conservative rule — folder that contains the triggering `.api2ai`. */
function resolveBootstrapProjectRootFromSource(api2aiSourcePath: string): string {
    return path.dirname(path.resolve(api2aiSourcePath));
}

function resolveBundledMcpServeSourcePath(): string {
    const embed = resolveEmbedHomeDirectory();
    if (embed) {
        return path.join(embed, 'resources', 'mcp-serve-emitted.mjs');
    }
    return path.resolve(__generatorDirname, '..', 'resources', 'mcp-serve-emitted.mjs');
}

function resolveCliPackageJsonPathForVersions(): string {
    const embed = resolveEmbedHomeDirectory();
    if (embed) {
        return path.join(embed, 'package.json');
    }
    return path.resolve(__generatorDirname, '..', 'package.json');
}

function copyBundledMcpServeInto(cliDir: string): string {
    const src = resolveBundledMcpServeSourcePath();
    if (!fs.existsSync(src)) {
        throw new Error(
            `Bundled MCP host missing (${src}). Run npm run bundle:mcp-runtime from the workspace root.`
        );
    }
    if (!fs.existsSync(cliDir)) {
        fs.mkdirSync(cliDir, { recursive: true });
    }
    const dest = path.join(cliDir, 'mcp-serve.mjs');
    fs.copyFileSync(src, dest);
    return dest;
}

function readCliVersionsForBootstrap(): { sdk: string; zod: string } {
    const p = resolveCliPackageJsonPathForVersions();
    const raw = fs.readFileSync(p, 'utf-8');
    const pkg = JSON.parse(raw) as { dependencies?: Record<string, string> };
    return {
        sdk: pkg.dependencies?.['@modelcontextprotocol/sdk'] ?? '^1.29.0',
        zod: pkg.dependencies?.zod ?? '^4.4.3'
    };
}

function warnIfPackageJsonMissingMcpDeps(packageJsonDir: string): void {
    const pjsonPath = path.join(packageJsonDir, 'package.json');
    if (!fs.existsSync(pjsonPath)) {
        return;
    }
    let pkg: unknown;
    try {
        pkg = JSON.parse(fs.readFileSync(pjsonPath, 'utf-8'));
    } catch {
        return;
    }
    if (!pkg || typeof pkg !== 'object') {
        return;
    }
    const rec = pkg as { dependencies?: Record<string, string>; optionalDependencies?: Record<string, string> };
    const merged = {
        ...(rec.optionalDependencies ?? {}),
        ...(rec.dependencies ?? {})
    };
    const need = ['@modelcontextprotocol/sdk', 'zod'] as const;
    const missing = need.filter((key) => merged[key] === undefined);
    if (missing.length > 0) {
        console.warn(
            `[generate] "${pjsonPath}": install MCP runtime dependencies: ${missing.join(', ')} (npm install), then generated/cli/mcp-serve.mjs can run.`
        );
    }
}

function writeMinimalPackageJsonIfAbsent(projectRoot: string): void {
    const dest = path.join(projectRoot, 'package.json');
    if (fs.existsSync(dest)) {
        warnIfPackageJsonMissingMcpDeps(projectRoot);
        return;
    }
    const { sdk, zod } = readCliVersionsForBootstrap();
    const slug =
        path
            .basename(projectRoot)
            .replace(/[^a-zA-Z0-9-]/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'api2ai-project';
    const body = {
        name: slug,
        private: true,
        type: 'module',
        dependencies: {
            '@modelcontextprotocol/sdk': sdk,
            zod
        }
    };
    fs.writeFileSync(dest, `${JSON.stringify(body, null, 4)}\n`, 'utf-8');
}

export type ResolvedToolCodegen = {
    toolName: string;
    title: string;
    description: string;
    method: Model['operations'][number]['method'];
    path: string;
    example?: string;
};

function ensureParentDir(destination: string): void {
    const data = extractDestinationAndName(destination);
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
}

function serializeJsonForModule(value: unknown): string {
    return JSON.stringify(value, null, 4);
}

function resolveToolsFromLoaded(model: Model, loaded: LoadedOpenApi): ResolvedToolCodegen[] {
    return model.operations.map((operation) => {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            throw new Error(
                `Codegen: operation ${operation.method} ${operation.path} not found in OpenAPI (${model.openapi}). Re-run validates the DSL earlier – ensure spec matches.`
            );
        }
        return {
            toolName: requireToolName(operation),
            title: buildMcpTitle(operation, details),
            description: buildMcpDescription(operation, details, model.auth),
            method: operation.method,
            path: operation.path,
            example: operation.example
        };
    });
}

/** Validator-enforced invariant: a model that validates has `toolName` set. Returns trimmed text for stable keys and MCP titles. */
function requireToolName(operation: Operation): string {
    if (operation.toolName === undefined || operation.toolName.trim().length === 0) {
        throw new Error(
            `Codegen: operation ${operation.method} ${operation.path} is missing required \`toolName\`. Re-run after validation passes.`
        );
    }
    return operation.toolName.trim();
}

function buildSchemasFromLoaded(model: Model, loaded: LoadedOpenApi): Record<string, JsonSchemaDict> {
    const out: Record<string, JsonSchemaDict> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildToolInputSchema(details);
    }
    return out;
}

function buildQuerySerializationFromLoaded(
    model: Model,
    loaded: LoadedOpenApi
): Record<string, Record<string, { style: string; explode: boolean }>> {
    const out: Record<string, Record<string, { style: string; explode: boolean }>> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildQueryParamSerializationLookup(details);
    }
    return out;
}

async function loadOpenApiForModel(model: Model, sourcePath: string): Promise<LoadedOpenApi> {
    const absSource = path.resolve(sourcePath);
    const baseDir = path.dirname(absSource);
    return loadOpenApi(model.openapi, baseDir);
}

function mergeParallelToolData(
    toolsMeta: ResolvedToolCodegen[],
    schemas: Record<string, JsonSchemaDict>,
    querySerialization: Record<string, Record<string, { style: string; explode: boolean }>>
): { toolsLiteral: string; schemasLiteral: string; querySerializationLiteral: string } {
    const toolsLiteral = serializeJsonForModule(toolsMeta);
    const orderedSchemas: Record<string, JsonSchemaDict> = {};
    const orderedQuerySerialization: Record<string, Record<string, { style: string; explode: boolean }>> = {};
    for (const t of toolsMeta) {
        orderedSchemas[t.toolName] =
            schemas[t.toolName] ??
            ({
                type: 'object',
                description: 'Fallback schema.',
                properties: {},
                additionalProperties: true
            } as JsonSchemaDict);
        orderedQuerySerialization[t.toolName] = querySerialization[t.toolName] ?? {};
    }
    return {
        toolsLiteral,
        schemasLiteral: serializeJsonForModule(orderedSchemas),
        querySerializationLiteral: serializeJsonForModule(orderedQuerySerialization)
    };
}

function createSharedInvokeBlock(inputSchemaLiteralBody: string, querySerializationLiteralBody: string): string {
    return `
export const inputSchemaByTool = ${inputSchemaLiteralBody};

export const queryParamSerializationByTool = ${querySerializationLiteralBody};

function appendSerializedQueryParams(searchParams, toolName, query) {
    if (!query) {
        return;
    }
    const hintsByParam = queryParamSerializationByTool[toolName] ?? {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            const hint = hintsByParam[key];
            const style = hint && hint.style ? hint.style : 'form';
            const explode = hint && typeof hint.explode === 'boolean' ? hint.explode : true;
            if (style !== 'form') {
                throw new Error(
                    'invokeTool: query array param "' +
                        key +
                        '" uses OpenAPI style "' +
                        style +
                        '"; only style "form" is supported for arrays.'
                );
            }
            const parts = [];
            for (const element of value) {
                if (element === undefined || element === null) {
                    continue;
                }
                parts.push(String(element));
            }
            if (parts.length === 0) {
                continue;
            }
            if (explode) {
                for (const p of parts) {
                    searchParams.append(key, p);
                }
            } else {
                searchParams.set(key, parts.join(','));
            }
            continue;
        }
        searchParams.set(key, String(value));
    }
}

function resolveAuthValue(auth) {
    const secret = process.env[auth.env];
    if (!secret) {
        throw new Error('Missing required environment variable ' + auth.env + ' for API auth.');
    }
    return (auth.prefix ?? '') + secret;
}

export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const effectiveBaseUrl = options.baseUrl ?? baseUrl;
    const normalizedBaseUrl = effectiveBaseUrl.endsWith('/') ? effectiveBaseUrl.slice(0, -1) : effectiveBaseUrl;
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(options.pathParams ?? {})) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, options.query);
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };
    if (authConfig) {
        const authValue = resolveAuthValue(authConfig);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };

    if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            bodySnippet = '';
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            if (authConfig) {
                msg +=
                    ' Check the credential in environment variable ' +
                    authConfig.env +
                    ' (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
            } else {
                msg += ' The API may require authentication.';
            }
        } else if (response.status === 403) {
            msg += ' Forbidden: insufficient permission for this request.';
        } else if (response.status === 429) {
            msg += ' Too Many Requests (rate limited).';
            if (retryAfter) {
                msg += ' Retry-After: ' + retryAfter + ' (seconds or HTTP-date per server).';
            } else {
                msg += ' Wait before retrying.';
            }
        }
        if (bodySnippet) {
            msg += ' Response body: ' + bodySnippet;
        }
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
`.trim();
}

function renderAuthConfig(model: Model): string {
    if (!model.auth) {
        return 'undefined';
    }
    return JSON.stringify(
        {
            location: model.auth.location,
            name: model.auth.name,
            env: model.auth.env,
            prefix: model.auth.prefix
        },
        null,
        4
    );
}

function renderSourceReference(source: string): string {
    return path.basename(source);
}

function renderTsModule(
    enrichedToolsLiteral: string,
    inputSchemaBlock: string,
    model: Model,
    source: string
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);

    const fileNode = expandToNode`
/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */

export const baseUrl = ${JSON.stringify(model.baseUrl)};

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
};

export const generatedTools: GeneratedTool[] = ${enrichedToolsLiteral};

export type InvokeOptions = {
    baseUrl?: string;
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    env: string;
    prefix?: string;
};

const authConfig: AuthConfig | undefined = ${authConfigLiteral};
        
${inputSchemaBlock}
    `.appendNewLineIfNotEmpty();
    return toString(fileNode);
}

function renderJsModule(
    enrichedToolsLiteral: string,
    inputSchemaEmbedded: string,
    model: Model,
    source: string
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);
    return `/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */

export const baseUrl = ${JSON.stringify(model.baseUrl)};

export const generatedTools = ${enrichedToolsLiteral};

const authConfig = ${authConfigLiteral};

${inputSchemaEmbedded}
`;
}

export async function generateOutput(model: Model, source: string, destination: string): Promise<GeneratedOutputFiles> {
    ensureParentDir(destination);
    const parsed = path.parse(destination);
    const tsPath = parsed.ext === '.ts' ? destination : path.join(parsed.dir, `${parsed.name}.ts`);
    const jsPath = path.join(parsed.dir, `${parsed.name}.mjs`);

    const loaded = await loadOpenApiForModel(model, source);
    const toolsMeta = resolveToolsFromLoaded(model, loaded);
    const schemas = buildSchemasFromLoaded(model, loaded);
    const querySerialization = buildQuerySerializationFromLoaded(model, loaded);
    const { toolsLiteral, schemasLiteral, querySerializationLiteral } = mergeParallelToolData(toolsMeta, schemas, querySerialization);
    const invokeBlock = createSharedInvokeBlock(schemasLiteral, querySerializationLiteral);

    fs.writeFileSync(tsPath, renderTsModule(toolsLiteral, invokeBlock, model, source));
    fs.writeFileSync(jsPath, renderJsModule(toolsLiteral, invokeBlock, model, source));

    const cliDir = resolveGeneratedCliDir(tsPath);
    const mcpServePath = copyBundledMcpServeInto(cliDir);
    writeMinimalPackageJsonIfAbsent(resolveBootstrapProjectRootFromSource(source));

    return { tsPath, jsPath, mcpServePath };
}
