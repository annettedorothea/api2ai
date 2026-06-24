/**
 * Generated from: todo.api2ai
 * Referenced OpenAPI: ./openapi/todo-api.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/todo-tools/verifyTodoCredentials.js';

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
        toolName: 'listCategories',
        title: 'List todo categories',
        description:
            'Intent:\nList todo categories. Requires API key (MCP x-api-token → x-api-key).\n\nMeta:\noperationId: list-categories\n\nExample:\nList todo categories\n\nResponse:\nHTTP 200 — top-level categories array. Each category: id, name, color (ids: work, home, errands).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'listTodos',
        title: 'List todos',
        description:
            'Intent:\nList todos; optional filter by status (open|done) or categoryId.\n\nMeta:\noperationId: list-todos\n\nParameters:\n- categoryId (query): Optional query filter by category id — from listCategories categories[].id (work, home, errands). (example: work)\n- status (query): Optional query filter: open or done only (OpenAPI enum). (example: open)\n\nExample:\nList open todos\n\nResponse:\nHTTP 200 — top-level todos array. Each todo: id, title, status (open|done), categoryId, dueDate.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'listTodosByCategory',
        title: 'List todos by category',
        description:
            'Intent:\nList todos in one category. Optional query status: open or done.\n\nMeta:\noperationId: list-todos-by-category\n\nParameters:\n- categoryId (path): Category id (path). Values: work, home, errands — from listCategories categories[].id. (example: work)\n- status (query): Optional query filter: open or done only. (example: open)\n\nExample:\nList open todos in category work\n\nResponse:\nHTTP 200 — top-level categoryId and todos array (same todo shape as listTodos).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Unknown category (invalid categoryId)\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories/{categoryId}/todos',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'getTodo',
        title: 'Get todo by id',
        description:
            'Intent:\nFetch one todo by path todoId (e.g. t-1).\n\nMeta:\noperationId: get-todo\n\nParameters:\n- todoId (path): Todo id (path) from listTodos todos[].id or createTodo response todo.id. (example: t-1)\n\nExample:\nGet todo t-1\n\nResponse:\nHTTP 200 — top-level property todo (id, title, status, categoryId, dueDate).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos/{todoId}',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'createTodo',
        title: 'Create todo',
        description:
            'Intent:\nCreate a todo. Use response todo.id for updateTodo or deleteTodo.\n\nMeta:\noperationId: create-todo\n\nRequest body:\nJSON object. Required: title (string), categoryId (work, home, or errands).\n        Optional: status (open|done), dueDate (ISO date YYYY-MM-DD).\n        Do not send id — server assigns it (e.g. t-5).\n\nExample:\nCreate todo Buy milk in errands\n\nResponse:\nHTTP 201 — top-level property todo with generated id (use todo.id next).\n        Documented errors:\n        HTTP 400 — Invalid input\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Unknown categoryId\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
        method: 'POST',
        path: '/todos',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'updateTodo',
        title: 'Update todo',
        description:
            'Intent:\nUpdate a todo by path todoId (from createTodo or listTodos).\n\nMeta:\noperationId: update-todo\n\nParameters:\n- todoId (path): Todo id to update (path) — from createTodo todo.id or listTodos todos[].id. (example: t-1)\n\nRequest body:\nJSON object; send only fields to change (all optional): title, status (open|done),\n        categoryId (work, home, errands), dueDate (ISO date YYYY-MM-DD).\n        At least one field required. Do not send id in body.\n\nExample:\nMark todo t-1 as done\n\nResponse:\nHTTP 200 — top-level property todo with updated fields.\n        Documented errors:\n        HTTP 400 — Invalid input\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo or category not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
        method: 'PATCH',
        path: '/todos/{todoId}',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'deleteTodo',
        title: 'Delete todo',
        description:
            'Intent:\nDelete a todo by path todoId.\n\nMeta:\noperationId: delete-todo\n\nParameters:\n- todoId (path): Todo id to delete (path) — from createTodo todo.id or listTodos todos[].id. (example: t-2)\n\nExample:\nDelete todo t-2\n\nResponse:\nHTTP 200 — top-level todoId and deleted: true.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
        method: 'DELETE',
        path: '/todos/{todoId}',
        access: 'protected',
        hasAuthorize: false,
        hasPrepare: false
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
    name: 'x-api-key',
    prefix: ''
};

export { verifyCredential, toModuleCredentials } from '../../../src/hooks/api2ai/todo-tools/verifyTodoCredentials.js';
export type {
    VerifyCredentialInput,
    VerifyCredentialResult,
    ModuleCredentials,
    TodoCredentials
} from '../../../src/hooks/api2ai/todo-tools/verifyTodoCredentials.js';

export const mcpServerName = 'todo-tools';
export const mcpServerVersion = '0.5.0';

export const inputZodByTool = {
    listCategories: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
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
    listTodos: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({
                    status: z
                        .union([z.literal('open'), z.literal('done')])
                        .describe('Optional query filter: open or done only (OpenAPI enum). (example: open)')
                        .optional(),
                    categoryId: z
                        .string()
                        .describe(
                            'Optional query filter by category id — from listCategories categories[].id (work, home, errands). (example: work)'
                        )
                        .optional()
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
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    listTodosByCategory: z
        .object({
            pathParams: z
                .object({
                    categoryId: z
                        .string()
                        .describe(
                            'Category id (path). Values: work, home, errands — from listCategories categories[].id. (example: work)'
                        )
                })
                .strict()
                .describe('Path parameters from OpenAPI.'),
            query: z
                .object({
                    status: z
                        .union([z.literal('open'), z.literal('done')])
                        .describe('Optional query filter: open or done only. (example: open)')
                        .optional()
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
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTodo: z
        .object({
            pathParams: z
                .object({
                    todoId: z
                        .string()
                        .describe(
                            'Todo id (path) from listTodos todos[].id or createTodo response todo.id. (example: t-1)'
                        )
                })
                .strict()
                .describe('Path parameters from OpenAPI.'),
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
    createTodo: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Optional query overrides.')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .object({
                    title: z.string(),
                    categoryId: z.string(),
                    status: z.union([z.literal('open'), z.literal('done')]).optional(),
                    dueDate: z.string().optional()
                })
                .strict()
                .describe(
                    'JSON object. Required: title (string), categoryId (work, home, or errands).\n        Optional: status (open|done), dueDate (ISO date YYYY-MM-DD).\n        Do not send id — server assigns it (e.g. t-5).'
                )
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    updateTodo: z
        .object({
            pathParams: z
                .object({
                    todoId: z
                        .string()
                        .describe(
                            'Todo id to update (path) — from createTodo todo.id or listTodos todos[].id. (example: t-1)'
                        )
                })
                .strict()
                .describe('Path parameters from OpenAPI.'),
            query: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Optional query overrides.')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .object({
                    title: z.string().optional(),
                    status: z.union([z.literal('open'), z.literal('done')]).optional(),
                    categoryId: z.string().optional(),
                    dueDate: z.string().optional()
                })
                .strict()
                .describe(
                    'JSON object; send only fields to change (all optional): title, status (open|done),\n        categoryId (work, home, errands), dueDate (ISO date YYYY-MM-DD).\n        At least one field required. Do not send id in body.'
                )
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    deleteTodo: z
        .object({
            pathParams: z
                .object({
                    todoId: z
                        .string()
                        .describe(
                            'Todo id to delete (path) — from createTodo todo.id or listTodos todos[].id. (example: t-2)'
                        )
                })
                .strict()
                .describe('Path parameters from OpenAPI.'),
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

const queryParamSerializationByTool = {
    listCategories: {},
    listTodos: {
        status: {
            style: 'form',
            explode: true
        },
        categoryId: {
            style: 'form',
            explode: true
        }
    },
    listTodosByCategory: {
        status: {
            style: 'form',
            explode: true
        }
    },
    getTodo: {},
    createTodo: {},
    updateTodo: {},
    deleteTodo: {}
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
    let upstreamCredential = host.upstreamCredential;
    const optionsResolved = options;
    let authCredential = host.credential;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
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
            if (authConfig && tool.access === 'protected') {
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
