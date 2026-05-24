import type { Model, Operation } from 'api-2-ai-dsl-language';
import { expandToNode, toString } from 'langium/generate';
import type { LoadedOpenApi } from 'api-2-ai-dsl-language';
import { loadOpenApi, makeOperationLookupKey } from 'api-2-ai-dsl-language';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { extractDestinationAndName } from './util.js';
import {
    emitGeneratedZodPreamble,
    emitInputZodByToolExport
} from './json-schema-to-zod-codegen.js';
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
    // VS Code extension embed bundle (CJS): esbuild sets __dirname next to cli.cjs + resources/.
    if (typeof __dirname !== 'undefined' && __dirname.length > 0) {
        return __dirname;
    }
    // CLI via `node packages/cli/...` (ESM source).
    return path.dirname(url.fileURLToPath(import.meta.url));
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

function resolveCliPackageRoot(): string {
    const embed = resolveEmbedHomeDirectory();
    if (embed) {
        return embed;
    }
    const oneUp = path.resolve(__generatorDirname, '..');
    if (fs.existsSync(path.join(oneUp, 'package.json'))) {
        return oneUp;
    }
    return path.resolve(__generatorDirname, '..', '..');
}

function resolveBundledMcpServeSourcePath(): string {
    return path.join(resolveCliPackageRoot(), 'resources', 'mcp-serve-emitted.mjs');
}

function resolveCliPackageJsonPathForVersions(): string {
    return path.join(resolveCliPackageRoot(), 'package.json');
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

function readCliPackageJson(): { version: string; dependencies?: Record<string, string> } {
    const p = resolveCliPackageJsonPathForVersions();
    const raw = fs.readFileSync(p, 'utf-8');
    const pkg = JSON.parse(raw) as { version?: string; dependencies?: Record<string, string> };
    return {
        version: typeof pkg.version === 'string' ? pkg.version : '0.0.1',
        dependencies: pkg.dependencies
    };
}

function readCliVersionsForBootstrap(): { sdk: string; zod: string } {
    const pkg = readCliPackageJson();
    return {
        sdk: pkg.dependencies?.['@modelcontextprotocol/sdk'] ?? '^1.29.0',
        zod: pkg.dependencies?.zod ?? '^4.4.3'
    };
}

function resolveMcpServerIdentityFromDestination(destinationTsPath: string): { name: string; version: string } {
    const pkg = readCliPackageJson();
    return {
        name: path.parse(destinationTsPath).name,
        version: pkg.version
    };
}

function renderMcpServerIdentityExports(name: string, version: string): string {
    return `export const mcpServerName = ${JSON.stringify(name)};
export const mcpServerVersion = ${JSON.stringify(version)};
`;
}

function renderMcpHostAdapterBlock(authKind: 'none' | 'credential'): string {
    const authCheck =
        authKind === 'credential'
            ? `
        if (!credential) {
            throw new Error(
                'Missing host credential. Pass --auth-env on mcp-serve.mjs and set the variable (re-read on every tool call).'
            );
        }`
            : `
        credential = credential || undefined;`;
    return `const META_BASE_URL_ENV_KEY = 'MCP_HOST_BASE_URL_ENV_KEY';
const META_AUTH_ENV_KEY = 'MCP_HOST_AUTH_ENV_KEY';
const META_ENV_DIRS = 'MCP_HOST_ENV_DIRS';

function applyHostEnvKeys(hostConfig, envDirs) {
    process.env[META_BASE_URL_ENV_KEY] = hostConfig.baseUrlEnv;
    if (hostConfig.authEnv) {
        process.env[META_AUTH_ENV_KEY] = hostConfig.authEnv;
    } else {
        delete process.env[META_AUTH_ENV_KEY];
    }
    if (envDirs.length > 0) {
        process.env[META_ENV_DIRS] = JSON.stringify(envDirs);
    } else {
        delete process.env[META_ENV_DIRS];
    }
}

function decodeJwtPayloadUnsafe(token) {
    const parts = String(token).trim().split('.');
    if (parts.length !== 3) {
        throw new Error('credential is not a JWT (expected three dot-separated segments).');
    }
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

export const mcpHostAdapter = {
    configureFromArgv(argv, envDirs) {
        let baseUrlEnv;
        let authEnv;
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (arg === '--base-url-env') {
                baseUrlEnv = argv[++i];
                if (!baseUrlEnv) {
                    throw new Error('Missing value after --base-url-env');
                }
                continue;
            }
            if (arg === '--auth-env') {
                authEnv = argv[++i];
                if (!authEnv) {
                    throw new Error('Missing value after --auth-env');
                }
                continue;
            }
            if (arg.startsWith('-')) {
                throw new Error('Unknown option: ' + arg);
            }
            throw new Error('Unexpected positional argument: ' + arg);
        }
        if (!baseUrlEnv) {
            throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
        }
        applyHostEnvKeys({ baseUrlEnv, authEnv }, envDirs);
    },

    validateAtStartup(requiresAuth) {
        const baseUrlEnvName = process.env[META_BASE_URL_ENV_KEY]?.trim();
        if (!baseUrlEnvName) {
            throw new Error('Host base URL env key is not configured.');
        }
        const baseUrl = process.env[baseUrlEnvName]?.trim();
        if (!baseUrl) {
            throw new Error(
                'Environment variable "' + baseUrlEnvName + '" is missing or empty (required by --base-url-env).'
            );
        }
        if (!requiresAuth) {
            return;
        }
        const authEnvName = process.env[META_AUTH_ENV_KEY]?.trim();
        if (!authEnvName) {
            throw new Error('Generated tools require auth; pass --auth-env <ENV_VAR_NAME> on the MCP host.');
        }
        const credential = process.env[authEnvName]?.trim();
        if (!credential) {
            throw new Error(
                'Environment variable "' + authEnvName + '" is missing or empty (required by --auth-env).'
            );
        }
    },

    resolveHostContext() {
        const baseUrlKey = process.env[META_BASE_URL_ENV_KEY]?.trim();
        const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
        if (!baseUrl) {
            throw new Error(
                'Missing host base URL. Pass --base-url-env on mcp-serve.mjs and set the variable (or use smoke-generated).'
            );
        }

        const authKey = process.env[META_AUTH_ENV_KEY]?.trim();
        let credential = authKey ? process.env[authKey]?.trim() : undefined;${authCheck}

        let jwt;
        if (credential) {
            const segments = String(credential).trim().split('.');
            if (segments.length === 3) {
                try {
                    jwt = decodeJwtPayloadUnsafe(credential);
                } catch {
                    jwt = undefined;
                }
            }
        }

        return { baseUrl, credential, jwt };
    },

    envDirsForReload() {
        const raw = process.env[META_ENV_DIRS];
        if (!raw?.trim()) {
            return [];
        }
        try {
            const dirs = JSON.parse(raw);
            if (Array.isArray(dirs) && dirs.every((d) => typeof d === 'string')) {
                return dirs;
            }
        } catch {
            // ignore malformed config
        }
        return [];
    }
};
`;
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
    public: boolean;
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
            description: buildMcpDescription(operation, details, model.auth, model.insecureEnv),
            method: operation.method,
            path: operation.path,
            example: operation.example,
            public: operation.public === true
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
        const jwtBound = model.auth?.fromJwt?.trim();
        const omitJwtPath =
            operation.public === true ? undefined : jwtBound && jwtBound.length > 0 ? jwtBound : undefined;
        const base = buildToolInputSchema(details, omitJwtPath);
        out[requireToolName(operation)] = base;
    }
    return out;
}

function authRuntimeKind(model: Model): 'none' | 'credential' {
    return model.auth ? 'credential' : 'none';
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
): {
    toolsLiteral: string;
    orderedSchemas: Record<string, JsonSchemaDict>;
    querySerializationLiteral: string;
} {
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
        orderedSchemas,
        querySerializationLiteral: serializeJsonForModule(orderedQuerySerialization)
    };
}

function buildInputZodBlock(orderedSchemas: Record<string, JsonSchemaDict>): string {
    return `${emitGeneratedZodPreamble()}\n${emitInputZodByToolExport(orderedSchemas)}\n`;
}

function createSharedInvokeBlock(
    querySerializationLiteralBody: string,
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean,
    usesFromJwt: boolean
): string {
    const insecureTlsSetup = usesInsecureTls
        ? `
import { Agent, fetch } from 'undici';

const insecureTlsDispatcher = new Agent({ connect: { rejectUnauthorized: false } });
`
        : '';
    const jwtHelpers = usesFromJwt
        ? `
function resolvePathParamsWithFromJwt(authConfig, pathParams, jwt) {
    const base = { ...(pathParams ?? {}) };
    const claim = authConfig?.fromJwt;
    if (!claim) {
        return base;
    }
    if (!jwt || typeof jwt !== 'object') {
        throw new Error('fromJwt requires a JWT in host context (set --auth-env to a JWT).');
    }
    const value = jwt[claim];
    if (value === undefined || value === null || String(value).trim() === '') {
        throw new Error('fromJwt: JWT payload missing claim "' + claim + '".');
    }
    base[claim] = String(value).trim();
    return base;
}
`
        : '';

    const authHelpers =
        authKind === 'credential'
            ? `
function resolveAuthSecret(authConfig, credential) {
    if (!credential || !String(credential).trim()) {
        throw new Error('Missing host credential (MCP host --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}`
            : '';

    const resolveCall =
        authKind === 'none'
            ? ''
            : `
    if (authConfig && !tool.public) {
        const authValue = resolveAuthSecret(authConfig, credential);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }`;

    const auth401Block =
        authKind === 'credential'
            ? `msg +=
                    ' Check MCP host --auth-env (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';`
            : '';

    const insecureTlsFetch = usesInsecureTls
        ? `
    if (insecureTls) {
        requestInit.dispatcher = insecureTlsDispatcher;
    }`
        : '';

    return `${insecureTlsSetup}
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
${jwtHelpers}${authHelpers}

export async function invokeTool(toolName, options = {}, hostContext) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const host = hostContext ?? mcpHostAdapter.resolveHostContext();
    const { baseUrl, credential, jwt } = host;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = !tool.public && authConfig?.fromJwt
        ? resolvePathParamsWithFromJwt(authConfig, options.pathParams, jwt)
        : { ...(options.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, options.query);
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };${resolveCall}

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };

    if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(options.body);
    }${insecureTlsFetch}

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
            if (authConfig && !tool.public) {
                ${auth401Block}
            } else if (!tool.public) {
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
            prefix: model.auth.prefix,
            fromJwt: model.auth.fromJwt
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
    mcpServerIdentityBlock: string,
    toolRuntimeBlock: string,
    model: Model,
    source: string,
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);
    const insecureTlsExport = usesInsecureTls
        ? '\nexport const insecureTls = true;\n'
        : '\nexport const insecureTls = false;\n';

    const authDecl = `type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
    fromJwt?: string;
};

export const requiresAuth = ${model.auth && model.operations.some((op) => !op.public) ? 'true' : 'false'};
export const authConfig: AuthConfig | undefined = ${authConfigLiteral};`;

    const fileNode = expandToNode`
/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */
${insecureTlsExport}
export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
    /** When true, no auth header or fromJwt binding (e.g. login). */
    public?: boolean;
};

export const generatedTools: GeneratedTool[] = ${enrichedToolsLiteral};

export type InvokeOptions = {
    /** MCP tool arguments only (not visible to the agent: host context via mcpHostAdapter). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

${authDecl}

${mcpServerIdentityBlock}
${toolRuntimeBlock}
    `.appendNewLineIfNotEmpty();
    return toString(fileNode);
}

function renderJsModule(
    enrichedToolsLiteral: string,
    mcpServerIdentityBlock: string,
    toolRuntimeBlock: string,
    model: Model,
    source: string,
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean
): string {
    const sourceReference = renderSourceReference(source);
    return `/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */

export const insecureTls = ${usesInsecureTls ? 'true' : 'false'};

export const generatedTools = ${enrichedToolsLiteral};

export const requiresAuth = ${model.auth && model.operations.some((op) => !op.public) ? 'true' : 'false'};

export const authConfig = ${renderAuthConfig(model)};

${mcpServerIdentityBlock}
${toolRuntimeBlock}
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
    const { toolsLiteral, orderedSchemas, querySerializationLiteral } = mergeParallelToolData(
        toolsMeta,
        schemas,
        querySerialization
    );
    const authKind = authRuntimeKind(model);
    const usesInsecureTls = model.insecureEnv === true;
    const usesFromJwt = Boolean(model.auth?.fromJwt?.trim());
    const mcpServerIdentity = resolveMcpServerIdentityFromDestination(tsPath);
    const mcpServerIdentityBlock = renderMcpServerIdentityExports(mcpServerIdentity.name, mcpServerIdentity.version);
    const mcpHostAdapterBlock = renderMcpHostAdapterBlock(authKind);
    const toolRuntimeBlock = `${buildInputZodBlock(orderedSchemas)}\n${mcpHostAdapterBlock}\n${createSharedInvokeBlock(
        querySerializationLiteral,
        authKind,
        usesInsecureTls,
        usesFromJwt
    )}`;

    fs.writeFileSync(
        tsPath,
        renderTsModule(toolsLiteral, mcpServerIdentityBlock, toolRuntimeBlock, model, source, authKind, usesInsecureTls)
    );
    fs.writeFileSync(
        jsPath,
        renderJsModule(toolsLiteral, mcpServerIdentityBlock, toolRuntimeBlock, model, source, authKind, usesInsecureTls)
    );

    const cliDir = resolveGeneratedCliDir(tsPath);
    const mcpServePath = copyBundledMcpServeInto(cliDir);
    writeMinimalPackageJsonIfAbsent(resolveBootstrapProjectRootFromSource(source));

    return { tsPath, jsPath, mcpServePath };
}
