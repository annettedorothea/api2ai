import type { Model, Operation } from 'api-2-ai-dsl-language';
import { isBearerEnvAuth, isBearerSealedAuth } from 'api-2-ai-dsl-language';
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
            description: buildMcpDescription(operation, details, model.auth, model.insecureEnv),
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
        const base = buildToolInputSchema(details);
        out[requireToolName(operation)] = augmentInvokeSchemaWithSealedCredential(base, model);
    }
    return out;
}

function augmentInvokeSchemaWithSealedCredential(schema: JsonSchemaDict, model: Model): JsonSchemaDict {
    if (!model.auth || !isBearerSealedAuth(model.auth)) {
        return schema;
    }
    const existingProps = (schema.properties ?? {}) as Record<string, JsonSchemaDict>;
    const prevRequired = Array.isArray(schema.required) ? (schema.required as string[]) : [];
    const required = prevRequired.includes('sealedCredential') ? prevRequired : [...prevRequired, 'sealedCredential'];
    return {
        ...schema,
        properties: {
            ...existingProps,
            sealedCredential: {
                type: 'string',
                description:
                    'Base64 A2S1 sealed credential (RSA-OAEP SHA-256 + AES-256-GCM). Generate with: node examples/scripts/seal-bearer-helper.mjs seal --public-key <public.pem> --pat <token> (or --stdin)'
            }
        },
        required
    };
}

function authRuntimeKind(model: Model): 'none' | 'env' | 'sealed' {
    if (!model.auth) {
        return 'none';
    }
    return isBearerSealedAuth(model.auth) ? 'sealed' : 'env';
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

function createSharedInvokeBlock(
    inputSchemaLiteralBody: string,
    querySerializationLiteralBody: string,
    authKind: 'none' | 'env' | 'sealed',
    usesInsecureTls: boolean
): string {
    const insecureTlsSetup = usesInsecureTls
        ? `
import { Agent, fetch } from 'undici';

const insecureTlsDispatcher = new Agent({ connect: { rejectUnauthorized: false } });
`
        : '';
    const authHelpers =
        authKind === 'env'
            ? `
function resolveAuthSecret(authConfig, options) {
    const secret = process.env[authConfig.env];
    if (!secret) {
        throw new Error('Missing required environment variable ' + authConfig.env + ' for API auth.');
    }
    return (authConfig.prefix ?? '') + secret;
}`
            : authKind === 'sealed'
              ? `
function unsealA2S1(b64, privateKeyPem) {
    const blob = Buffer.from(String(b64).trim(), 'base64');
    const MAGIC = Buffer.from('A2S1', 'ascii');
    if (blob.length < MAGIC.length + 2 + 12 + 16) {
        throw new Error('sealedCredential blob too short');
    }
    if (!blob.subarray(0, MAGIC.length).equals(MAGIC)) {
        throw new Error('sealedCredential: bad magic (expected A2S1 wire format)');
    }
    let o = MAGIC.length;
    const rsaLen = blob.readUInt16BE(o);
    o += 2;
    const rsaCipher = blob.subarray(o, o + rsaLen);
    o += rsaLen;
    const iv = blob.subarray(o, o + 12);
    o += 12;
    const aesPayload = blob.subarray(o);
    const tag = aesPayload.subarray(aesPayload.length - 16);
    const enc = aesPayload.subarray(0, aesPayload.length - 16);
    const aesKey = privateDecrypt({ key: privateKeyPem, padding: 4, oaepHash: 'sha256' }, rsaCipher);
    const decipher = createDecipheriv('aes-256-gcm', aesKey, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

function loadPrivateKeyPem(privateKeyEnv) {
    const raw = process.env[privateKeyEnv];
    if (!raw || !String(raw).trim()) {
        throw new Error('Missing private key PEM in environment variable ' + privateKeyEnv + ' for bearerSealed auth.');
    }
    const trimmed = String(raw).trim();
    if (trimmed.startsWith('-----BEGIN')) {
        return trimmed;
    }
    const rel = trimmed.replace(/^\\.\\/+/, '');
    const candidates = [];
    const seen = new Set();
    function add(p) {
        const resolved = path.resolve(p);
        if (!seen.has(resolved)) {
            seen.add(resolved);
            candidates.push(resolved);
        }
    }
    add(trimmed);
    let dir = process.cwd();
    for (let i = 0; i < 12; i++) {
        add(path.join(dir, rel));
        const up = path.dirname(dir);
        if (up === dir) {
            break;
        }
        dir = up;
    }
    let lastErr;
    for (const p of candidates) {
        try {
            return readFileSync(p, 'utf8').trim();
        } catch (e) {
            lastErr = e;
        }
    }
    const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    throw new Error(
        'Failed to read private key from path in environment variable ' +
            privateKeyEnv +
            ' (expected inline PEM starting with -----BEGIN, an absolute path, or a path relative to cwd / parent directories up to the workspace root): ' +
            msg
    );
}

function resolveAuthSecret(authConfig, options) {
    const b64 = options?.sealedCredential;
    if (!b64 || typeof b64 !== 'string' || !String(b64).trim()) {
        throw new Error('InvokeOptions.sealedCredential (base64) is required for bearerSealed auth.');
    }
    const token = unsealA2S1(b64, loadPrivateKeyPem(authConfig.privateKeyEnv));
    return (authConfig.prefix ?? '') + token;
}`
              : '';

    const resolveCall =
        authKind === 'none'
            ? ''
            : `
    if (authConfig) {
        const authValue = resolveAuthSecret(authConfig, options);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }`;

    const auth401Block =
        authKind === 'env'
            ? `msg +=
                    ' Check the credential in environment variable ' +
                    authConfig.env +
                    ' (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';`
            : authKind === 'sealed'
              ? `msg +=
                    ' Check environment variable ' +
                    authConfig.privateKeyEnv +
                    ' (inline PEM or path to a .pem file) and pass sealedCredential (base64) on invoke.';`
              : '';

    const insecureTlsFetch = usesInsecureTls
        ? `
    if (insecureTls) {
        requestInit.dispatcher = insecureTlsDispatcher;
    }`
        : '';

    return `${insecureTlsSetup}
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
${authHelpers}

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
            if (authConfig) {
                ${auth401Block}
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
    if (isBearerSealedAuth(model.auth)) {
        return JSON.stringify(
            {
                kind: 'bearerSealed',
                location: model.auth.location,
                name: model.auth.name,
                privateKeyEnv: model.auth.privateKeyEnv,
                prefix: model.auth.prefix
            },
            null,
            4
        );
    }
    if (isBearerEnvAuth(model.auth)) {
        return JSON.stringify(
            {
                kind: 'bearerEnv',
                location: model.auth.location,
                name: model.auth.name,
                env: model.auth.env,
                prefix: model.auth.prefix
            },
            null,
            4
        );
    }
    return 'undefined';
}

function renderSourceReference(source: string): string {
    return path.basename(source);
}

function renderTsModule(
    enrichedToolsLiteral: string,
    inputSchemaBlock: string,
    model: Model,
    source: string,
    authKind: 'none' | 'env' | 'sealed',
    usesInsecureTls: boolean
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);
    const cryptoImport =
        authKind === 'sealed'
            ? "import { createDecipheriv, privateDecrypt } from 'node:crypto';\nimport { readFileSync } from 'node:fs';\nimport path from 'node:path';\n\n"
            : '';
    const insecureTlsExport = usesInsecureTls
        ? '\nexport const insecureTls = true;\n'
        : '\nexport const insecureTls = false;\n';

    const sealedInvokeField =
        authKind === 'sealed'
            ? `
    /** Base64 A2S1 sealed credential (required when \`auth bearerSealed\`; matches JSON schema \`required\`). */
    sealedCredential: string;`
            : '';

    const authDecl =
        authKind === 'none'
            ? 'const authConfig = undefined;'
            : authKind === 'env'
              ? `type AuthConfig = {
    kind: 'bearerEnv';
    location: 'header' | 'query';
    name: string;
    env: string;
    prefix?: string;
};

const authConfig: AuthConfig | undefined = ${authConfigLiteral};`
              : `type AuthConfig = {
    kind: 'bearerSealed';
    location: 'header' | 'query';
    name: string;
    privateKeyEnv: string;
    prefix?: string;
};

const authConfig: AuthConfig | undefined = ${authConfigLiteral};`;

    const fileNode = expandToNode`
${cryptoImport}/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */

export const baseUrl = ${JSON.stringify(model.baseUrl)};${insecureTlsExport}
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
    body?: unknown;${sealedInvokeField}
};

${authDecl}
        
${inputSchemaBlock}
    `.appendNewLineIfNotEmpty();
    return toString(fileNode);
}

function renderJsModule(
    enrichedToolsLiteral: string,
    inputSchemaEmbedded: string,
    model: Model,
    source: string,
    authKind: 'none' | 'env' | 'sealed',
    usesInsecureTls: boolean
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);
    const cryptoImport =
        authKind === 'sealed'
            ? "import { createDecipheriv, privateDecrypt } from 'node:crypto';\nimport { readFileSync } from 'node:fs';\nimport path from 'node:path';\n\n"
            : '';
    return `${cryptoImport}/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */

export const baseUrl = ${JSON.stringify(model.baseUrl)};

export const insecureTls = ${usesInsecureTls ? 'true' : 'false'};

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
    const authKind = authRuntimeKind(model);
    const usesInsecureTls = model.insecureEnv === true;
    const invokeBlock = createSharedInvokeBlock(schemasLiteral, querySerializationLiteral, authKind, usesInsecureTls);

    fs.writeFileSync(tsPath, renderTsModule(toolsLiteral, invokeBlock, model, source, authKind, usesInsecureTls));
    fs.writeFileSync(jsPath, renderJsModule(toolsLiteral, invokeBlock, model, source, authKind, usesInsecureTls));

    const cliDir = resolveGeneratedCliDir(tsPath);
    const mcpServePath = copyBundledMcpServeInto(cliDir);
    writeMinimalPackageJsonIfAbsent(resolveBootstrapProjectRootFromSource(source));

    return { tsPath, jsPath, mcpServePath };
}
