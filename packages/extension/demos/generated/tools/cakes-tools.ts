/**
 * Generated from: cakes.api2ai
 * Referenced OpenAPI: ./openapi/cakes-api.openapi.yaml
 */
import { loggingAdapter } from '../../src/utils/logging-adapter.js';
import { verifyCredential } from '../../src/auth/cakes-tools/verifyCredential.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
    access: 'public' | 'protected' | 'checked';
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'searchCakes',
        title: 'Search cake recipes by keyword',
        description:
            'Intent:\nSearch cake and torte recipes by keyword (query q).\n        Matches title and keywords such as Erdbeer, Hefeteig, Rührteig, Schwarzwälder Kirschtorte.\n        Empty q returns all cakes. Requires Bearer JWT validated by the upstream API.\n\nAPI:\nRequires Bearer JWT. Optional query q matches title and keywords (case-insensitive).\n\nMeta:\noperationId: search-cakes\n\nExample:\nSearch cakes with Erdbeer\n\nResponse:\nHTTP 200\nMatching cakes\nproperties (top-level): cakes, count, query\nDocumented errors:\nHTTP 401 — Missing or invalid token\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/cakes',
        example: 'Search cakes with Erdbeer',
        access: 'protected'
    },
    {
        toolName: 'getCake',
        title: 'Get cake recipe by id',
        description:
            'Intent:\nFetch one cake recipe by id (path cakeId), including ingredients and prep time.\n        Requires Bearer JWT validated by the upstream API.\n\nMeta:\noperationId: get-cake\n\nExample:\nGet Schwarzwälder Kirschtorte recipe\n\nResponse:\nHTTP 200\nCake recipe\nproperties (top-level): cake\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 404 — Unknown cake id\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/cakes/{cakeId}',
        example: 'Get Schwarzwälder Kirschtorte recipe',
        access: 'protected'
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by stdio-mcp-server / http-mcp-server). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
    sessionClaims?: Record<string, unknown>;
};

export type CheckedHostContext = {
    credential: string;
    sessionClaims?: Record<string, unknown>;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
};

export const requiresAuth = true;
export const authConfig: AuthConfig | undefined = {
    location: 'header',
    name: 'Authorization',
    prefix: 'Bearer '
};

export { verifyCredential } from '../../src/auth/cakes-tools/verifyCredential.js';
export type { VerifyCredentialInput, VerifyCredentialResult } from '../../src/auth/cakes-tools/verifyCredential.js';

export const mcpServerName = 'cakes-tools';
export const mcpServerVersion = '0.3.0';

import * as z from 'zod/v4';

export const inputZodByTool = {
    searchCakes: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({ q: z.string().optional() })
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
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getCake: z
        .object({
            pathParams: z.object({ cakeId: z.string() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Optional query overrides.')
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

export const queryParamSerializationByTool = {
    searchCakes: {
        q: {
            style: 'form',
            explode: true
        }
    },
    getCake: {}
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
        throw new Error(
            'Missing host credential (stdio: --auth-env; HTTP: auth header; OAuth HTTP: Bearer after MCP login).'
        );
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
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let credential = host.credential;
    if (tool.access !== 'public') {
        if (!credential || !String(credential).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; relay HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        if (host.sessionClaims === undefined) {
            const verified = await verifyCredential({ inboundCredential: String(credential).trim() });
            credential = verified.upstreamCredential;
        }
    }
    const optionsResolved = options;
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
    if (authConfig && tool.access !== 'public') {
        const authValue = resolveAuthSecret(authConfig!, credential);
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
            msg += ' Unauthorized.';
            if (authConfig && tool.access !== 'public') {
                msg +=
                    ' Check MCP host --auth-env on stdio-mcp-server (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
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
