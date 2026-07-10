/**
 * Generated from: xquik.api2ai
 * Referenced OpenAPI: ./openapi/xquik.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/xquik-tools/verifyXquikCredential.js';
import { prepareToolCallForSearchXquikTweets } from '../../../src/hooks/api2ai/xquik-tools/prepareToolCallForSearchXquikTweets.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'searchXquikTweets',
        title: 'Search X posts',
        description:
            'Intent:\nSearch X posts by keyword, Tweet ID, status URL, account, or date window.\n        Use queryType Latest for timeline-style checks and Top for engagement-ranked research.\n        Use next_cursor from a previous response as cursor for pagination.\n\nMCP arguments:\npass q, queryType, cursor, sinceTime, untilTime, limit, fromUser as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: search-tweets\n\nParameters:\n- cursor (query): Pagination cursor from the previous response. (type: string)\n- fromUser (query): Optional username filter without @. (type: string) (example: xquik)\n- limit (query): Maximum posts to return. Keep this small for agent workflows. (type: integer) (example: 20)\n- q (query): Required query string, Tweet ID, or X status URL. (type: string) (example: open source agents)\n- queryType (query): Sort order for keyword search. (type: string)\n- sinceTime (query): ISO 8601 timestamp. Return tweets after this time. (type: string)\n- untilTime (query): ISO 8601 timestamp. Return tweets before this time. (type: string)\n\nExample:\nFind recent posts about open source agents\n\nResponse:\nHTTP 200 returns tweets plus has_next_page and next_cursor.\n        Each tweet includes id, text, createdAt, metrics, and author fields.\n        Documented errors: HTTP 400 invalid query, HTTP 401 missing API key, HTTP 402 payment required, HTTP 429 rate limit exceeded.\n\nRuntime: protected — implement prepareToolCallForSearchXquikTweets in src/hooks/api2ai/xquik-tools/prepareToolCallForSearchXquikTweets.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/api/v1/x/tweets/search',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: true
    },
    {
        toolName: 'searchXquikUsers',
        title: 'Search X users',
        description:
            'Intent:\nSearch X users by name or username.\n        Use this before user-scoped timeline tools when the user only provides a handle-like name.\n        Use next_cursor from a previous response as cursor for pagination.\n\nMCP arguments:\npass q, cursor as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: search-users\n\nParameters:\n- cursor (query): Pagination cursor from the previous response. (type: string)\n- q (query): User search query. (type: string)\n\nExample:\nFind accounts named Xquik\n\nResponse:\nHTTP 200 returns users plus has_next_page and next_cursor.\n        Each user can include id, username, name, verified, followers, and following.\n        Documented errors: HTTP 400 invalid query, HTTP 401 missing API key, HTTP 402 payment required, HTTP 429 rate limit exceeded.\n\nRuntime: protected — implement src/hooks/api2ai/xquik-tools/verifyXquikCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/api/v1/x/users/search',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'lookupXquikTweet',
        title: 'Get X post by ID',
        description:
            'Intent:\nLook up one X post by Tweet ID.\n        Use ids returned by searchXquikTweets, or parse the numeric id from an X status URL first.\n\nMCP arguments:\npass id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: lookup-tweet\n\nParameters:\n- id (path): Tweet ID from search results or an X status URL. (type: string) (example: 1234567890)\n\nExample:\nGet Tweet ID 1234567890\n\nResponse:\nHTTP 200 returns tweet and author objects.\n        Documented errors: HTTP 400 invalid id, HTTP 401 missing API key, HTTP 402 payment required, HTTP 404 not found, HTTP 429 rate limit exceeded.\n\nRuntime: protected — implement src/hooks/api2ai/xquik-tools/verifyXquikCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/api/v1/x/tweets/{id}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by the MCP host in servers/*). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
};

export const requiresAuth = true;
export const authConfig: AuthConfig | undefined = {
    location: 'header',
    name: 'x-api-key',
    prefix: ''
};

export { verifyCredential } from '../../../src/hooks/api2ai/xquik-tools/verifyXquikCredential.js';

export const mcpServerName = 'xquik-tools';
export const mcpServerVersion = '1.0.0-rc.4';

export { mcpBuildGeneratedAt } from '../mcp-build-generated-at.js';

const prepareToolCallHooks: Record<
    string,
    (options: InvokeOptions, credential?: string) => InvokeOptions | Promise<InvokeOptions>
> = {
    searchXquikTweets: (options, credential) => prepareToolCallForSearchXquikTweets(options, credential!)
};

export const inputZodByTool = {
    searchXquikTweets: z
        .object({
            q: z
                .string()
                .describe(
                    'Required query string, Tweet ID, or X status URL. (type: string) (example: open source agents)'
                ),
            queryType: z
                .union([z.literal('Latest'), z.literal('Top')])
                .describe('Sort order for keyword search. (type: string)')
                .optional(),
            cursor: z.string().describe('Pagination cursor from the previous response. (type: string)').optional(),
            sinceTime: z
                .string()
                .describe('ISO 8601 timestamp. Return tweets after this time. (type: string)')
                .optional(),
            untilTime: z
                .string()
                .describe('ISO 8601 timestamp. Return tweets before this time. (type: string)')
                .optional(),
            limit: z
                .number()
                .int()
                .describe('Maximum posts to return. Keep this small for agent workflows. (type: integer) (example: 20)')
                .optional(),
            fromUser: z
                .string()
                .describe('Optional username filter without @. (type: string) (example: xquik)')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    searchXquikUsers: z
        .object({
            q: z.string().describe('User search query. (type: string)'),
            cursor: z.string().describe('Pagination cursor from the previous response. (type: string)').optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    lookupXquikTweet: z
        .object({
            id: z
                .string()
                .describe('Tweet ID from search results or an X status URL. (type: string) (example: 1234567890)'),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.')
};

const invokeParamBucketsByTool = {
    searchXquikTweets: {
        pathParams: [],
        query: ['q', 'queryType', 'cursor', 'sinceTime', 'untilTime', 'limit', 'fromUser'],
        headers: [],
        arrayQuery: []
    },
    searchXquikUsers: {
        pathParams: [],
        query: ['q', 'cursor'],
        headers: [],
        arrayQuery: []
    },
    lookupXquikTweet: {
        pathParams: ['id'],
        query: [],
        headers: [],
        arrayQuery: []
    }
};

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
    const buckets = (
        invokeParamBucketsByTool as Record<
            string,
            { pathParams?: string[]; query?: string[]; headers?: string[]; arrayQuery?: string[] }
        >
    )[toolName];
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
            query: prepareQueryBucket(toolName, isInvokeQueryBucketValue(options.query) ? options.query : undefined)
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> =
        isInvokeQueryBucketValue(options.query)
            ? {
                  ...(options.query as Record<
                      string,
                      string | number | boolean | ReadonlyArray<string | number | boolean>
                  >)
              }
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
}
const queryParamSerializationByTool = {
    searchXquikTweets: {
        q: {
            style: 'form',
            explode: true
        },
        queryType: {
            style: 'form',
            explode: true
        },
        cursor: {
            style: 'form',
            explode: true
        },
        sinceTime: {
            style: 'form',
            explode: true
        },
        untilTime: {
            style: 'form',
            explode: true
        },
        limit: {
            style: 'form',
            explode: true
        },
        fromUser: {
            style: 'form',
            explode: true
        }
    },
    searchXquikUsers: {
        q: {
            style: 'form',
            explode: true
        },
        cursor: {
            style: 'form',
            explode: true
        }
    },
    lookupXquikTweet: {}
};
const queryParamWireNamesByTool = {
    searchXquikTweets: {},
    searchXquikUsers: {},
    lookupXquikTweet: {}
};
const pathParamWireNamesByTool = {
    searchXquikTweets: {},
    searchXquikUsers: {},
    lookupXquikTweet: {}
};
const headerParamWireNamesByTool = {
    searchXquikTweets: {},
    searchXquikUsers: {},
    lookupXquikTweet: {}
};

function appendSerializedQueryParams(
    searchParams: URLSearchParams,
    toolName: string,
    query: InvokeOptions['query']
): void {
    if (!query) {
        return;
    }
    const hintsByParam: Record<string, { style?: string; explode?: boolean }> =
        (queryParamSerializationByTool as Record<string, Record<string, { style?: string; explode?: boolean }>>)[
            toolName
        ] ?? {};
    const wireNames: Record<string, string> =
        (queryParamWireNamesByTool as Record<string, Record<string, string>>)[toolName] ?? {};
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
}

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
}
async function performToolHttpRequest(
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
}

export async function invokeTool(
    toolName: string,
    options: InvokeOptions = {},
    hostContext?: ApiHostContext
): Promise<unknown> {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }
    loggingAdapter.debug('invokeTool', { toolName, method: tool.method, path: tool.path });
    let optionsResolved = normalizeInvokeOptions(toolName, options);

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (servers/*-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let credential: string | undefined = host.credential?.trim() ? String(host.credential).trim() : undefined;
    let authCredential: string | undefined = credential;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on the MCP host; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        credential = String(inbound).trim();
        await verifyCredential(credential);
        authCredential = credential;
    }
    if (tool.hasPrepareToolCall) {
        const prepareToolCall = prepareToolCallHooks[toolName];
        if (typeof prepareToolCall !== 'function') {
            throw new Error('No prepareToolCall hook for tool: ' + toolName);
        }
        if (tool.access === 'protected') {
            if (credential === undefined) {
                throw new Error('prepareToolCall requires credential for protected tools.');
            }
            optionsResolved = await Promise.resolve(prepareToolCall(optionsResolved, credential));
        } else {
            optionsResolved = await Promise.resolve(prepareToolCall(optionsResolved));
        }
    }
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    const pathWireNames: Record<string, string> =
        (pathParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        const wireKey = pathWireNames[key] ?? key;
        resolvedPath = resolvedPath.split('{' + wireKey + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const headerWireNames: Record<string, string> =
        (headerParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json'
    };
    if (optionsResolved.headers) {
        for (const [key, value] of Object.entries(optionsResolved.headers)) {
            const wireKey = headerWireNames[key] ?? key;
            requestHeaders[wireKey] = value;
        }
    }
    if (authConfig && tool.access === 'protected') {
        const authValue = resolveAuthSecret(authConfig!, authCredential);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }

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
            if (authConfig && tool.access === 'protected') {
                msg += ' Check MCP host --auth-env (' + authConfig.location + ' ' + authConfig.name + ').';
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
        loggingAdapter.error(msg, { toolName: tool.toolName, status: response.status });
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
