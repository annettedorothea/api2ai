import { renderInvokePipeline, type InvokePipelineTier, type HookStubMaps } from './render-check-stubs.js';
import { urlAndHeadersPreambleFragment } from '../codegen/fragments/url-preamble.js';
import { renderDecodeHttpSuccessHelpers } from './decode-http-response-fragment.js';
import { renderAfterToolCallBlock } from '@toolfactory.dev/core/codegen';

function renderAuthHelpers(authKind: 'none' | 'credential'): string {
    if (authKind !== 'credential') {
        return '';
    }
    return `
function resolveAuthSecret(
    authConfig: { location: 'header' | 'query'; name: string; prefix?: string },
    credential: string | undefined
): string {
    if (!credential || !String(credential).trim()) {
        throw new Error(
            'Missing host credential (stdio: --auth-env; HTTP: auth header; OAuth HTTP: Bearer after MCP login).'
        );
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}`;
}

function renderAuthApplicationBlock(authKind: 'none' | 'credential'): string {
    if (authKind === 'none') {
        return '';
    }
    return `
    if (authConfig && tool.access === 'protected') {
        const authValue = resolveAuthSecret(authConfig!, authCredential);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }`;
}

function renderAuth401Hint(authKind: 'none' | 'credential'): string {
    return authKind === 'credential'
        ? `msg +=
                    ' Check MCP host --auth-env (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';`
        : '';
}

function renderNormalizeInvokeOptions(invokeParamBucketsLiteralBody: string): string {
    return `const invokeParamBucketsByTool = ${invokeParamBucketsLiteralBody};

function splitInvokeQueryArrayValue(value: string): ReadonlyArray<string | number | boolean> {
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function prepareQueryBucket(toolName: string, bucket: InvokeOptions['query']): InvokeOptions['query'] {
    if (!bucket) {
        return undefined;
    }
    const arrayQueryKeys = new Set(
        (invokeParamBucketsByTool as Record<string, { arrayQuery?: string[] }>)[toolName]?.arrayQuery ?? []
    );
    const out: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (arrayQueryKeys.has(key) && typeof value === 'string') {
            out[key] = splitInvokeQueryArrayValue(value);
            continue;
        }
        out[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function omitNullishPathParams(
    bucket: Record<string, string | number | boolean> | undefined
): Record<string, string | number | boolean> | undefined {
    if (!bucket) {
        return undefined;
    }
    const out: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        out[key] = value;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function isInvokeQueryBucketValue(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeInvokeOptions(toolName: string, options: InvokeOptions): InvokeOptions {
    const buckets = (invokeParamBucketsByTool as Record<
        string,
        { pathParams?: string[]; query?: string[]; headers?: string[]; arrayQuery?: string[] }
    >)[toolName];
    if (!buckets) {
        return options;
    }
    const pathKeys = buckets.pathParams ?? [];
    const queryKeys = buckets.query ?? [];
    const headerKeys = buckets.headers ?? [];
    const arrayQueryKeys = new Set(buckets.arrayQuery ?? []);
    const knownFlatKeys = new Set([...pathKeys, ...queryKeys, ...headerKeys]);
    const hasTopLevelFlatParam = Object.keys(options).some((key) => {
        if (key === 'body' || key === 'pathParams' || key === 'headers') {
            return false;
        }
        if (key === 'query') {
            return queryKeys.includes('query') && !isInvokeQueryBucketValue(options.query);
        }
        return knownFlatKeys.has(key);
    });
    if (!hasTopLevelFlatParam) {
        return {
            ...options,
            pathParams: omitNullishPathParams(options.pathParams),
            query: prepareQueryBucket(
                toolName,
                isInvokeQueryBucketValue(options.query) ? options.query : undefined
            )
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> =
        isInvokeQueryBucketValue(options.query)
            ? { ...(options.query as Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>) }
            : {};
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams') {
            continue;
        }
        if (key === 'query') {
            if (queryKeys.includes('query') && !isInvokeQueryBucketValue(value)) {
                if (arrayQueryKeys.has(key) && typeof value === 'string') {
                    query[key] = splitInvokeQueryArrayValue(value);
                } else {
                    query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
                }
            }
            continue;
        }
        if (key === 'headers') {
            if (headerKeys.length === 0 && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(headers, value as Record<string, string>);
            }
            continue;
        }
        if (pathKeys.includes(key)) {
            pathParams[key] = value as string | number | boolean;
        } else if (queryKeys.includes(key)) {
            if (arrayQueryKeys.has(key) && typeof value === 'string') {
                query[key] = splitInvokeQueryArrayValue(value);
            } else {
                query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
            }
        } else if (headerKeys.includes(key)) {
            headers[key] = String(value);
        }
    }

    return {
        pathParams: omitNullishPathParams(pathParams),
        query: prepareQueryBucket(toolName, query),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: options.body
    };
}`;
}

function renderQuerySerializationHelpers(
    querySerializationLiteralBody: string,
    queryParamWireNamesLiteralBody: string,
    pathParamWireNamesLiteralBody: string,
    headerParamWireNamesLiteralBody: string
): string {
    return `const queryParamSerializationByTool = ${querySerializationLiteralBody};
const queryParamWireNamesByTool = ${queryParamWireNamesLiteralBody};
const pathParamWireNamesByTool = ${pathParamWireNamesLiteralBody};
const headerParamWireNamesByTool = ${headerParamWireNamesLiteralBody};

function appendSerializedQueryParams(
    searchParams: URLSearchParams,
    toolName: string,
    query: InvokeOptions['query']
): void {
    if (!query) {
        return;
    }
    const hintsByParam: Record<string, { style?: string; explode?: boolean }> = (queryParamSerializationByTool as Record<string, Record<string, { style?: string; explode?: boolean }>>)[toolName] ?? {};
    const wireNames: Record<string, string> = (queryParamWireNamesByTool as Record<string, Record<string, string>>)[toolName] ?? {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        const wireKey = wireNames[key] ?? key;
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
            const parts: string[] = [];
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
                    searchParams.append(wireKey, p);
                }
            } else {
                searchParams.set(wireKey, parts.join(','));
            }
            continue;
        }
        searchParams.set(wireKey, String(value));
    }
}`;
}

function renderHostBinding(): string {
    return `
    if (hostContext === undefined) {
        throw new Error(
            'invokeTool requires hostContext from the MCP host (servers/*-mcp-server).'
        );
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;`;
}

function renderPerformToolHttpRequest(): string {
    return `async function performToolHttpRequest(
    url: URL,
    init: { method: string; headers: Record<string, string>; body?: string }
): Promise<Response> {
    if (init.method !== 'TRACE') {
        return fetch(url, init as RequestInit);
    }
    const client = url.protocol === 'https:' ? await import('node:https') : await import('node:http');
    return new Promise((resolve, reject) => {
        const req = client.request(
            {
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port || undefined,
                path: url.pathname + url.search,
                method: 'TRACE',
                headers: init.headers
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer) => chunks.push(chunk));
                res.on('end', () => {
                    const responseHeaders = new Headers();
                    for (const [name, value] of Object.entries(res.headers)) {
                        if (value === undefined) {
                            continue;
                        }
                        if (Array.isArray(value)) {
                            for (const entry of value) {
                                responseHeaders.append(name, entry);
                            }
                        } else {
                            responseHeaders.set(name, value);
                        }
                    }
                    resolve(
                        new Response(Buffer.concat(chunks), {
                            status: res.statusCode ?? 500,
                            headers: responseHeaders
                        })
                    );
                });
            }
        );
        req.on('error', reject);
        if (init.body) {
            req.write(init.body);
        }
        req.end();
    });
}`;
}

function renderInvokeToolFunction(
    authKind: 'none' | 'credential',
    invokePipelineTier: InvokePipelineTier,
    stubMaps: HookStubMaps,
    hasVerifyCredential: boolean
): string {
    const resolveCall = renderAuthApplicationBlock(authKind);
    const auth401Block = renderAuth401Hint(authKind);
    const auth401Section =
        authKind === 'credential'
            ? `if (authConfig && tool.access === 'protected') {
                ${auth401Block}
            }`
            : `if (tool.access === 'protected') {
                msg += ' The API may require authentication.';
            }`;
    const authPipeline =
        invokePipelineTier === 'none'
            ? urlAndHeadersPreambleFragment()
            : renderInvokePipeline(invokePipelineTier, hasVerifyCredential, stubMaps, authKind === 'credential');
    const hostBinding = renderHostBinding();
    const optionsResolvedDecl = stubMaps.prepareToolCall
        ? 'let optionsResolved = normalizeInvokeOptions(toolName, options);'
        : 'const optionsResolved = normalizeInvokeOptions(toolName, options);';
    const afterToolCallBlock = renderAfterToolCallBlock(stubMaps, 'tool', 'result');
    const successReturn = stubMaps.afterToolCall
        ? `    let result: unknown = await decodeHttpSuccessResponse(response, tool.method, tool.toolName);
${afterToolCallBlock}
    return result;`
        : `    return decodeHttpSuccessResponse(response, tool.method, tool.toolName);`;

    return `export async function invokeTool(
    toolName: string,
    options: InvokeOptions = {},
    hostContext?: ApiHostContext
): Promise<unknown> {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }
    loggingAdapter.debug('invokeTool', { toolName, method: tool.method, path: tool.path });
    ${optionsResolvedDecl}
${hostBinding}${authPipeline}${resolveCall}

    const requestInit: Record<string, unknown> = {
        method: tool.method,
        headers: requestHeaders
    };

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }

    const response = await performToolHttpRequest(url, {
        method: tool.method,
        headers: requestHeaders as Record<string, string>,
        body: typeof requestInit.body === 'string' ? requestInit.body : undefined
    });
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            /* ignore unreadable error body */
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            ${auth401Section}
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
        loggingAdapter.error(msg, { toolName: tool.toolName, status: response.status });
        throw new Error(msg);
    }

${successReturn}
}`;
}

export function createSharedInvokeBlock(
    querySerializationLiteralBody: string,
    queryParamWireNamesLiteralBody: string,
    pathParamWireNamesLiteralBody: string,
    headerParamWireNamesLiteralBody: string,
    invokeParamBucketsLiteralBody: string,
    authKind: 'none' | 'credential',
    invokePipelineTier: InvokePipelineTier,
    stubMaps: HookStubMaps,
    hasVerifyCredential = false
): string {
    return `${renderNormalizeInvokeOptions(invokeParamBucketsLiteralBody)}
${renderQuerySerializationHelpers(
    querySerializationLiteralBody,
    queryParamWireNamesLiteralBody,
    pathParamWireNamesLiteralBody,
    headerParamWireNamesLiteralBody
)}
${renderAuthHelpers(authKind)}
${renderPerformToolHttpRequest()}
${renderDecodeHttpSuccessHelpers()}

${renderInvokeToolFunction(authKind, invokePipelineTier, stubMaps, hasVerifyCredential)}
`.trim();
}
