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
            'Intent:\nList todo categories before createTodo or when filtering by categoryId.\n        Response categories[].id values: work, home, errands.\n\nMeta:\noperationId: list-categories\n\nExample:\nList todo categories\n\nResponse:\nHTTP 200 — top-level categories array. Each category: id, name, color (ids: work, home, errands).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
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
            'Intent:\nList todos. Optional query filters: status (open|done), categoryId (work|home|errands).\n        Use todos[].id (e.g. t-1) as pathParams.todoId for getTodo, updateTodo, deleteTodo.\n        Call shape: query optional only — e.g. query: { "status": "open" } or {} for all todos.\n\nMeta:\noperationId: list-todos\n\nParameters:\n- categoryId (query): Optional query filter by category id — from listCategories categories[].id (work, home, errands). (example: work)\n- status (query): Optional query filter: open or done only. Omit to return all statuses. (example: open)\n\nExample:\nList all todos\n\nResponse:\nHTTP 200 — top-level todos array. Each todo: id, title, status (open|done), categoryId, dueDate.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
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
            'Intent:\nList todos in one category. categoryId is a path param (work, home, or errands).\n        Optional query.status: open or done.\n        Call shape: pathParams.categoryId required; query.status optional.\n\nMeta:\noperationId: list-todos-by-category\n\nParameters:\n- categoryId (path): Category id (path param pathParams.categoryId). Values: work, home, errands — from listCategories.\n                Do NOT use pathParams.id or pathParams.category. (example: work)\n- status (query): Optional query filter: open or done only. (example: open)\n\nExample:\nList open todos in category work\n\nResponse:\nHTTP 200 — top-level categoryId and todos array (same todo shape as listTodos).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Unknown category (invalid categoryId)\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
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
            'Intent:\nFetch one todo by id. Get todoId from listTodos todos[].id or createTodo todo.id.\n        Call shape: pathParams.todoId required — e.g. pathParams: { "todoId": "t-1" }.\n        Do NOT use pathParams.id.\n\nMeta:\noperationId: get-todo\n\nParameters:\n- todoId (path): Todo id as pathParams.todoId (NOT pathParams.id). From listTodos todos[].id or createTodo todo.id. (example: t-1)\n\nExample:\nGet todo t-1\n\nResponse:\nHTTP 200 — top-level property todo (id, title, status, categoryId, dueDate).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
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
            'Intent:\nCreate a todo. Save response todo.id for later updateTodo or deleteTodo.\n        Call shape: body required — e.g. body: { "title": "Buy milk", "categoryId": "errands" }.\n        categoryId must be work, home, or errands (from listCategories).\n\nMeta:\noperationId: create-todo\n\nRequest body:\nJSON body object (required). Required fields: title (string), categoryId (work|home|errands).\n        Optional: status (open|done, default open), dueDate (ISO date YYYY-MM-DD).\n        Do not send id in body — server assigns it (e.g. t-5).\n        Example: { "title": "Buy milk", "categoryId": "errands", "status": "open", "dueDate": "2026-06-15" }\n\nExample:\nCreate todo Buy milk in errands\n\nResponse:\nHTTP 201 — top-level property todo with generated id (use todo.id next).\n        Documented errors:\n        HTTP 400 — Invalid input\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Unknown categoryId\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
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
            'Intent:\nUpdate a todo. Requires pathParams.todoId from listTodos todos[].id (e.g. t-1) and body with at least one field.\n        Do NOT use pathParams.id — the path key is todoId.\n        Example — mark done: pathParams: { "todoId": "t-1" }, body: { "status": "done" }.\n        Example — rename: pathParams: { "todoId": "t-2" }, body: { "title": "Buy organic milk" }.\n\nMeta:\noperationId: update-todo\n\nParameters:\n- todoId (path): Todo id as pathParams.todoId (NOT pathParams.id). From listTodos todos[].id or createTodo todo.id. (example: t-1)\n\nRequest body:\nJSON body object (required). Send only fields to change; at least one required.\n        Fields: status (open|done), title (string), categoryId (work|home|errands), dueDate (YYYY-MM-DD).\n        Do not send id in body.\n        Example mark done: { "status": "done" }\n        Example reopen: { "status": "open" }\n\nExample:\nMark todo t-1 as done\n\nResponse:\nHTTP 200 — top-level property todo with updated fields.\n        Documented errors:\n        HTTP 400 — Invalid input\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo or category not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
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
            'Intent:\nDelete a todo permanently. Requires pathParams.todoId from listTodos todos[].id.\n        Do NOT use pathParams.id.\n        Call shape: pathParams: { "todoId": "t-2" } — no body required.\n\nMeta:\noperationId: delete-todo\n\nParameters:\n- todoId (path): Todo id as pathParams.todoId (NOT pathParams.id). From listTodos todos[].id or createTodo todo.id. (example: t-2)\n\nExample:\nDelete todo t-2\n\nResponse:\nHTTP 200 — top-level todoId and deleted: true.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredentials.ts; credential sent as header "x-api-key".',
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
                        .describe(
                            'Optional query filter: open or done only. Omit to return all statuses. (example: open)'
                        )
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
                            'Category id (path param pathParams.categoryId). Values: work, home, errands — from listCategories.\n                Do NOT use pathParams.id or pathParams.category. (example: work)'
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
                            'Todo id as pathParams.todoId (NOT pathParams.id). From listTodos todos[].id or createTodo todo.id. (example: t-1)'
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
                    'JSON body object (required). Required fields: title (string), categoryId (work|home|errands).\n        Optional: status (open|done, default open), dueDate (ISO date YYYY-MM-DD).\n        Do not send id in body — server assigns it (e.g. t-5).\n        Example: { "title": "Buy milk", "categoryId": "errands", "status": "open", "dueDate": "2026-06-15" }'
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
                            'Todo id as pathParams.todoId (NOT pathParams.id). From listTodos todos[].id or createTodo todo.id. (example: t-1)'
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
                    'JSON body object (required). Send only fields to change; at least one required.\n        Fields: status (open|done), title (string), categoryId (work|home|errands), dueDate (YYYY-MM-DD).\n        Do not send id in body.\n        Example mark done: { "status": "done" }\n        Example reopen: { "status": "open" }'
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
                            'Todo id as pathParams.todoId (NOT pathParams.id). From listTodos todos[].id or createTodo todo.id. (example: t-2)'
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
