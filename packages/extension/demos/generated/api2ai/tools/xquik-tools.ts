/**
 * Generated from: xquik.api2ai
 * Referenced OpenAPI: ./openapi/xquik-search.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/xquik-tools/verifyXquikCredentials.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasAuthorize: boolean;
    hasPrepare: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'searchXquikTweets',
        title: 'Search public X posts',
        description:
            'Intent:\n- Search public X posts with a user-provided Xquik API key.\n        - Use query q for keywords or X search operators.\n        - Keep limit small for interactive chats; use cursor only when the previous response includes next_cursor.\n        - Use queryType=Latest for chronological results or queryType=Top for engagement-ranked results.\n\nAPI:\nSearch tweets by query, Tweet ID, X status URL, or account date window.\n\nMeta:\ntags: Tweets | operationId: searchTweets\n\nParameters:\n- q (query): Search query.\n- queryType (query): Sort order.\n- cursor (query): Pagination cursor from the previous response.\n- sinceTime (query): ISO 8601 timestamp. Return posts after this time.\n- untilTime (query): ISO 8601 timestamp. Return posts before this time.\n- limit (query): Maximum number of posts to return.\n\nExample:\nFind recent posts about agentic workflows: query q=agentic workflows queryType=Latest limit=10\n\nResponse:\nHTTP 200\nproperties (top-level): tweets, has_next_page, next_cursor\nDocumented errors:\nHTTP 400 Bad request\nHTTP 401 Authentication failed\nHTTP 402 Payment or credits required\nHTTP 429 Rate limit exceeded\nHTTP 502 Service error\n\nRuntime: protected endpoint. Credential sent as header "X-API-Key".',
        method: 'GET',
        path: '/api/v1/x/tweets/search',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only. The host supplies ApiHostContext. */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
    upstreamCredential?: string;
    credentials?: unknown;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
};

export const requiresAuth = true;
export const authConfig: AuthConfig | undefined = {
    location: 'header',
    name: 'X-API-Key'
};

export { verifyCredential, toModuleCredentials } from '../../../src/hooks/api2ai/xquik-tools/verifyXquikCredentials.js';
export type {
    VerifyCredentialInput,
    VerifyCredentialResult,
    ModuleCredentials,
    XquikCredentials
} from '../../../src/hooks/api2ai/xquik-tools/verifyXquikCredentials.js';

export const mcpServerName = 'xquik-tools';
export const mcpServerVersion = '0.5.0';

export const inputZodByTool = {
    searchXquikTweets: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({
                    q: z.string().describe('Search query.'),
                    queryType: z
                        .union([z.literal('Latest'), z.literal('Top')])
                        .describe('Sort order.')
                        .optional(),
                    cursor: z.string().describe('Pagination cursor from the previous response.').optional(),
                    sinceTime: z.string().describe('ISO 8601 timestamp. Return posts after this time.').optional(),
                    untilTime: z.string().describe('ISO 8601 timestamp. Return posts before this time.').optional(),
                    limit: z.number().max(200).describe('Maximum number of posts to return.').optional()
                })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.')
};

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
        }
    }
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

function resolveAuthSecret(
    authConfig: { location: 'header' | 'query'; name: string; prefix?: string },
    credential: string | undefined
): string {
    if (!credential || !String(credential).trim()) {
        throw new Error('Missing host credential for Xquik.');
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
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

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host.');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let upstreamCredential = host.upstreamCredential;
    const optionsResolved = options;
    let authCredential = host.credential;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error('Missing host credential for Xquik.');
        }
        if (upstreamCredential === undefined) {
            const verified = await verifyCredential({ inboundCredential: String(inbound).trim() });
            upstreamCredential = verified.upstreamCredential;
        }
        authCredential = upstreamCredential ?? String(inbound).trim();
    }
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json',
        ...(optionsResolved.headers ?? {})
    };
    if (authConfig && tool.access === 'protected') {
        const authValue = resolveAuthSecret(authConfig, authCredential);
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

    const response = await fetch(url, requestInit as RequestInit);
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
            msg += ' Unauthorized. Check the Xquik API key.';
        } else if (response.status === 403) {
            msg += ' Forbidden: insufficient permission for this request.';
        } else if (response.status === 429) {
            msg += ' Too Many Requests.';
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
