/**
 * Generated from: mock-api.api2ai
 * Referenced OpenAPI: ./openapi/mock-api.openapi.yaml
 */
import { checkListCustomerOrdersParameters } from '../../src/auth/listCustomerOrders.js';

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
        toolName: 'listCustomerOrders',
        title: 'List customer orders',
        description:
            'Intent:\n- List orders for the authenticated customer (Bearer JWT from MCP host --auth-env).\n        - Path parameter customerId is optional: when empty or omitted, it is filled from the JWT claim customerId.\n        - Role user: customerId in the path must match the JWT claim; otherwise the call fails with 403.\n        - Role admin: may list orders for any customerId in the path (e.g. alice, bob).\n        - Returns customerId and an orders array (orderId, product, amount).\n        - Use without pathParams for "my orders"; use pathParams.customerId only when admin or when it matches the token.\n\nAPI:\nRequires Bearer JWT; for role=user customerId in path must match JWT claim, role=admin may read any customer.\n\nMeta:\noperationId: list-customer-orders\n\nExample:\nList my orders\n\nResponse:\nHTTP 200\nOrder list\nproperties (top-level): customerId, orders\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Token customerId does not match path\n\nRuntime: checked — implement checkListCustomerOrdersParameters in src/auth/listCustomerOrders.ts (types from this tools module; run build:generated for .js); credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/orders/{customerId}',
        example: 'List my orders',
        access: 'checked'
    },
    {
        toolName: 'login',
        title: 'Login customer',
        description:
            'Intent:\n- Log in a demo customer and obtain a short-lived HS256 JWT (access_token).\n        - Path parameter customerId is required (e.g. alice, bob, admin).\n        - No Authorization header or MCP credential required (public endpoint).\n        - Token claims include customerId and role (user or admin depending on the account).\n        - Copy access_token into .env.local as MOCK_API_ACCESS_TOKEN, then restart the MCP server for protected tools.\n        - Unknown customerId yields HTTP 404.\n\nAPI:\nIssues a short-lived HS256 JWT with claims customerId and role (admin or user). No authentication required.\n\nMeta:\noperationId: login-customer\n\nExample:\nLogin\n\nResponse:\nHTTP 200\nAccess token\nproperties (top-level): access_token\nDocumented errors:\nHTTP 404 — Unknown customer\n\nRuntime: public endpoint — no Authorization header or MCP credential required.',
        method: 'POST',
        path: '/login/{customerId}',
        example: 'Login',
        access: 'public'
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
    jwt?: Record<string, unknown>;
};

export type CheckedHostContext = {
    credential: string;
    jwt?: Record<string, unknown>;
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

export const mcpServerName = 'mock-api-tools';
export const mcpServerVersion = '0.0.5';

const parameterCheckers: Record<
    string,
    (options: InvokeOptions, host: CheckedHostContext) => InvokeOptions | Promise<InvokeOptions>
> = {
    listCustomerOrders: checkListCustomerOrdersParameters
};

import * as z from 'zod/v4';

export const inputZodByTool = {
    listCustomerOrders: z
        .object({
            pathParams: z
                .object({ customerId: z.string().optional() })
                .strict()
                .describe('Path parameters from OpenAPI.')
                .optional(),
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
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    login: z
        .object({
            pathParams: z.object({ customerId: z.string() }).strict().describe('Path parameters from OpenAPI.'),
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
    listCustomerOrders: {},
    login: {}
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
        throw new Error('Missing host credential (MCP host --auth-env).');
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

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl, credential } = host;
    if (tool.access !== 'public') {
        if (!credential || !String(credential).trim()) {
            throw new Error(
                'Missing host credential. Set the variable named by --auth-env on stdio-mcp-server (re-read on every tool call).'
            );
        }
    }
    let optionsResolved = options;
    if (tool.access === 'checked') {
        const check = parameterCheckers[toolName];
        if (typeof check !== 'function') {
            throw new Error('No parameter checker for checked tool: ' + toolName);
        }
        optionsResolved = await Promise.resolve(
            check(options, {
                credential: String(credential).trim(),
                jwt: host.jwt
            })
        );
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
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
