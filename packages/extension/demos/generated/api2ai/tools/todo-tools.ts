/**
 * Generated from: todo.api2ai
 * Referenced OpenAPI: ./openapi/todo-api.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import { verifyCredential } from '../../../src/auth/api2ai/todo-tools/verifyCredential.js';
import { checkListCategoriesParameters } from '../../../src/auth/api2ai/todo-tools/listCategories.js';
import { checkListTodosParameters } from '../../../src/auth/api2ai/todo-tools/listTodos.js';
import { checkListTodosByCategoryParameters } from '../../../src/auth/api2ai/todo-tools/listTodosByCategory.js';
import { checkGetTodoParameters } from '../../../src/auth/api2ai/todo-tools/getTodo.js';
import { checkCreateTodoParameters } from '../../../src/auth/api2ai/todo-tools/createTodo.js';
import { checkUpdateTodoParameters } from '../../../src/auth/api2ai/todo-tools/updateTodo.js';
import { checkDeleteTodoParameters } from '../../../src/auth/api2ai/todo-tools/deleteTodo.js';

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
        toolName: 'listCategories',
        title: 'List todo categories',
        description:
            'Intent:\n- List all todo categories (id, name, color).\n        - Requires API key on the upstream API (passed from MCP as x-api-token → x-api-key).\n\nMeta:\noperationId: list-categories\n\nExample:\nList todo categories\n\nResponse:\nHTTP 200\nCategory list\nproperties (top-level): categories\nDocumented errors:\nHTTP 401 — Missing or invalid API key\n\nRuntime: checked — implement checkListCategoriesParameters in src/auth/api2ai/todo-tools/listCategories.ts (types from this tools module; run build:generated for .js); credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories',
        example: 'List todo categories',
        access: 'checked'
    },
    {
        toolName: 'listTodos',
        title: 'List todos',
        description:
            'Intent:\n- List todos; optional query status (open|done) and categoryId.\n        - Returns todos array with id, title, status, categoryId, dueDate.\n\nMeta:\noperationId: list-todos\n\nExample:\nList open todos\n\nResponse:\nHTTP 200\nTodo list\nproperties (top-level): todos\nDocumented errors:\nHTTP 401 — Missing or invalid API key\n\nRuntime: checked — implement checkListTodosParameters in src/auth/api2ai/todo-tools/listTodos.ts (types from this tools module; run build:generated for .js); credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos',
        example: 'List open todos',
        access: 'checked'
    },
    {
        toolName: 'listTodosByCategory',
        title: 'List todos by category',
        description:
            'Intent:\n- List todos for one category (path categoryId, e.g. work, home, errands).\n        - Optional query status: open or done.\n        - Returns categoryId and todos array; HTTP 404 if categoryId is unknown.\n\nMeta:\noperationId: list-todos-by-category\n\nExample:\nList open todos in category work\n\nResponse:\nHTTP 200\nTodos for category\nproperties (top-level): categoryId, todos\nDocumented errors:\nHTTP 401 — Missing or invalid API key\nHTTP 404 — Unknown category\n\nRuntime: checked — implement checkListTodosByCategoryParameters in src/auth/api2ai/todo-tools/listTodosByCategory.ts (types from this tools module; run build:generated for .js); credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories/{categoryId}/todos',
        example: 'List open todos in category work',
        access: 'checked'
    },
    {
        toolName: 'getTodo',
        title: 'Get todo by id',
        description:
            'Intent:\n- Fetch a single todo by id (path todoId).\n        - Returns todo object or HTTP 404 when unknown.\n\nMeta:\noperationId: get-todo\n\nExample:\nGet todo t-1\n\nResponse:\nHTTP 200\nSingle todo\nproperties (top-level): todo\nDocumented errors:\nHTTP 401 — Missing or invalid API key\nHTTP 404 — Todo not found\n\nRuntime: checked — implement checkGetTodoParameters in src/auth/api2ai/todo-tools/getTodo.ts (types from this tools module; run build:generated for .js); credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos/{todoId}',
        example: 'Get todo t-1',
        access: 'checked'
    },
    {
        toolName: 'createTodo',
        title: 'Create todo',
        description:
            'Intent:\n- Create a todo (body: title, categoryId required; optional status open|done, dueDate).\n        - Returns created todo with generated id; HTTP 404 if categoryId is unknown.\n\nMeta:\noperationId: create-todo\n\nExample:\nCreate todo Buy milk in errands\n\nResponse:\nHTTP 201\nTodo created\nproperties (top-level): todo\nDocumented errors:\nHTTP 400 — Invalid input\nHTTP 401 — Missing or invalid API key\nHTTP 404 — Unknown category\n\nRuntime: checked — implement checkCreateTodoParameters in src/auth/api2ai/todo-tools/createTodo.ts (types from this tools module; run build:generated for .js); credential sent as header "x-api-key".',
        method: 'POST',
        path: '/todos',
        example: 'Create todo Buy milk in errands',
        access: 'checked'
    },
    {
        toolName: 'updateTodo',
        title: 'Update todo',
        description:
            'Intent:\n- Update a todo by id (path todoId; body fields title, status, categoryId, dueDate all optional).\n        - Returns updated todo; HTTP 404 when todo or categoryId is unknown.\n\nMeta:\noperationId: update-todo\n\nExample:\nMark todo t-1 as done\n\nResponse:\nHTTP 200\nUpdated todo\nproperties (top-level): todo\nDocumented errors:\nHTTP 400 — Invalid input\nHTTP 401 — Missing or invalid API key\nHTTP 404 — Todo or category not found\n\nRuntime: checked — implement checkUpdateTodoParameters in src/auth/api2ai/todo-tools/updateTodo.ts (types from this tools module; run build:generated for .js); credential sent as header "x-api-key".',
        method: 'PATCH',
        path: '/todos/{todoId}',
        example: 'Mark todo t-1 as done',
        access: 'checked'
    },
    {
        toolName: 'deleteTodo',
        title: 'Delete todo',
        description:
            'Intent:\n- Delete a todo by id (path todoId).\n        - Returns todoId and deleted true; HTTP 404 when unknown.\n\nMeta:\noperationId: delete-todo\n\nExample:\nDelete todo t-2\n\nResponse:\nHTTP 200\nTodo deleted\nproperties (top-level): deleted, todoId\nDocumented errors:\nHTTP 401 — Missing or invalid API key\nHTTP 404 — Todo not found\n\nRuntime: checked — implement checkDeleteTodoParameters in src/auth/api2ai/todo-tools/deleteTodo.ts (types from this tools module; run build:generated for .js); credential sent as header "x-api-key".',
        method: 'DELETE',
        path: '/todos/{todoId}',
        example: 'Delete todo t-2',
        access: 'checked'
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
    name: 'x-api-key',
    prefix: ''
};

export { verifyCredential } from '../../../src/auth/api2ai/todo-tools/verifyCredential.js';
export type {
    VerifyCredentialInput,
    VerifyCredentialResult
} from '../../../src/auth/api2ai/todo-tools/verifyCredential.js';

export const mcpServerName = 'todo-tools';
export const mcpServerVersion = '0.3.0';

const parameterCheckers: Record<
    string,
    (options: InvokeOptions, host: CheckedHostContext) => InvokeOptions | Promise<InvokeOptions>
> = {
    listCategories: checkListCategoriesParameters,
    listTodos: checkListTodosParameters,
    listTodosByCategory: checkListTodosByCategoryParameters,
    getTodo: checkGetTodoParameters,
    createTodo: checkCreateTodoParameters,
    updateTodo: checkUpdateTodoParameters,
    deleteTodo: checkDeleteTodoParameters
};

import * as z from 'zod/v4';

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
                    status: z.union([z.literal('open'), z.literal('done')]).optional(),
                    categoryId: z.string().optional()
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
            pathParams: z.object({ categoryId: z.string() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .object({ status: z.union([z.literal('open'), z.literal('done')]).optional() })
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
            pathParams: z.object({ todoId: z.string() }).strict().describe('Path parameters from OpenAPI.'),
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
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    updateTodo: z
        .object({
            pathParams: z.object({ todoId: z.string() }).strict().describe('Path parameters from OpenAPI.'),
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
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    deleteTodo: z
        .object({
            pathParams: z.object({ todoId: z.string() }).strict().describe('Path parameters from OpenAPI.'),
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
    let credential = host.credential;
    let sessionClaims = host.sessionClaims;
    if (tool.access !== 'public') {
        if (!credential || !String(credential).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        if (sessionClaims === undefined) {
            const verified = await verifyCredential({ inboundCredential: String(credential).trim() });
            credential = verified.upstreamCredential;
            sessionClaims = verified.sessionClaims;
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
                sessionClaims
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
        loggingAdapter.error(msg, { toolName: tool.toolName, status: response.status });
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
