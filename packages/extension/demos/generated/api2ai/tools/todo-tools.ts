/**
 * Generated from: todo.api2ai
 * Referenced OpenAPI: ./openapi/todo-api.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/todo-tools/verifyTodoCredential.js';
import { afterToolCallForListTodos } from '../../../src/hooks/api2ai/todo-tools/afterToolCallForListTodos.js';
import { afterToolCallForExportTodosPdf } from '../../../src/hooks/api2ai/todo-tools/afterToolCallForExportTodosPdf.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
    hasAfterToolCall: boolean;
    annotations?: {
        readOnlyHint?: boolean;
        destructiveHint?: boolean;
        idempotentHint?: boolean;
        openWorldHint?: boolean;
    };
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'listCategories',
        title: 'List todo categories',
        description:
            'Intent:\nList todo categories before createTodo or when filtering by categoryId.\n        Response categories[].id values: work, home, errands.\n\nMeta:\noperationId: list-categories\n\nExample:\nList todo categories\n\nResponse:\nHTTP 200 — top-level categories array. Each category: id, name, color (ids: work, home, errands).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false,
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: true
        }
    },
    {
        toolName: 'listTodos',
        title: 'List todos',
        description:
            'Intent:\nList todos. Optional API query filters: status (open|done), categoryId (work|home|errands).\n        Optional MCP-only titleContains (hookParams) filters titles client-side after the HTTP response — not sent to the API.\n        Use todos[].id (e.g. t-1) as todoId for getTodo, updateTodo, deleteTodo.\n        Call shape: query optional; titleContains optional top-level MCP arg.\n\nMCP arguments:\npass status, categoryId, titleContains as top-level tool arguments; hookParams (titleContains) are MCP-only and are not sent on the HTTP request. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: list-todos\n\nExample:\nList todos whose title contains milk\n\nResponse:\nHTTP 200 — top-level todos array. Each todo: id, title, status (open|done), categoryId, dueDate.\n        When titleContains is set, afterToolCall returns only matching todos.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement afterToolCallForListTodos in src/hooks/api2ai/todo-tools/afterToolCallForListTodos.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: true,
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: true
        }
    },
    {
        toolName: 'listTodosByCategory',
        title: 'List todos by category',
        description:
            'Intent:\nList todos in one category. categoryId is a path param (work, home, or errands).\n        Optional status: open or done.\n        Call shape: categoryId required; status optional.\n\nMCP arguments:\npass categoryId, status as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: list-todos-by-category\n\nExample:\nList open todos in category work\n\nResponse:\nHTTP 200 — top-level categoryId and todos array (same todo shape as listTodos).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Unknown category (invalid categoryId)\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories/{categoryId}/todos',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false,
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: true
        }
    },
    {
        toolName: 'getTodo',
        title: 'Get todo by id',
        description:
            'Intent:\nFetch one todo by id. Get todoId from listTodos todos[].id or createTodo todo.id.\n        Call shape: todoId required — e.g. { "todoId": "t-1" }.\n        Do NOT use id.\n\nMCP arguments:\npass todoId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: get-todo\n\nExample:\nGet todo t-1\n\nResponse:\nHTTP 200 — top-level property todo (id, title, status, categoryId, dueDate).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos/{todoId}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false,
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: true
        }
    },
    {
        toolName: 'createTodo',
        title: 'Create todo',
        description:
            'Intent:\nCreate a todo. Save response todo.id for later updateTodo or deleteTodo.\n        Call shape: body required — e.g. body: { "title": "Buy milk", "categoryId": "errands" }.\n        categoryId must be work, home, or errands (from listCategories).\n\nMCP arguments:\nsend the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: create-todo\n\nRequest body:\nJSON body object (required). Required fields: title (string), categoryId (work|home|errands).\n        Optional: status (open|done, default open), dueDate (ISO date YYYY-MM-DD).\n        Do not send id in body — server assigns it (e.g. t-5).\n        Example: { "title": "Buy milk", "categoryId": "errands", "status": "open", "dueDate": "2026-06-15" }\n\nExample:\nCreate todo Buy milk in errands\n\nResponse:\nHTTP 201 — top-level property todo with generated id (use todo.id next).\n        Documented errors:\n        HTTP 400 — Invalid input\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Unknown categoryId\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'POST',
        path: '/todos',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false,
        annotations: {
            destructiveHint: false,
            openWorldHint: true
        }
    },
    {
        toolName: 'updateTodo',
        title: 'Update todo',
        description:
            'Intent:\nUpdate a todo. Requires todoId from listTodos todos[].id (e.g. t-1) and body with at least one field.\n        Do NOT use id — the path key is todoId.\n        Example — mark done: { "todoId": "t-1" }, body: { "status": "done" }.\n        Example — rename: { "todoId": "t-2" }, body: { "title": "Buy organic milk" }.\n\nMCP arguments:\npass todoId as top-level tool arguments; send the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: update-todo\n\nRequest body:\nJSON body object (required). Send only fields to change; at least one required.\n        Fields: status (open|done), title (string), categoryId (work|home|errands), dueDate (YYYY-MM-DD).\n        Do not send id in body.\n        Example mark done: { "status": "done" }\n        Example reopen: { "status": "open" }\n\nExample:\nMark todo t-1 as done\n\nResponse:\nHTTP 200 — top-level property todo with updated fields.\n        Documented errors:\n        HTTP 400 — Invalid input\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo or category not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'PATCH',
        path: '/todos/{todoId}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false,
        annotations: {
            destructiveHint: false,
            openWorldHint: true
        }
    },
    {
        toolName: 'deleteTodo',
        title: 'Delete todo',
        description:
            'Intent:\nDelete a todo permanently. Requires todoId from listTodos todos[].id.\n        Do NOT use id.\n        Call shape: { "todoId": "t-2" } — no body required.\n\nMCP arguments:\npass todoId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: delete-todo\n\nExample:\nDelete todo t-2\n\nResponse:\nHTTP 200 — top-level todoId and deleted: true.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'DELETE',
        path: '/todos/{todoId}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false,
        annotations: {
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: true
        }
    },
    {
        toolName: 'exportTodosPdf',
        title: 'Export todos as PDF',
        description:
            'Intent:\nDownload the current todo list as a PDF (optional filters: status, categoryId — same as listTodos).\n        afterToolCall saves the PDF under the OS temp dir and returns path metadata (no Base64 data in the MCP result).\n        Prefer this when the user asks to export or download todos as a file.\n\nMCP arguments:\npass status, categoryId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: export-todos-pdf\n\nExample:\nExport open todos as PDF\n\nResponse:\nHTTP 200 — PDF saved by afterToolCall; result includes kind, contentType, filename, byteLength, path\n        (Base64 data stripped after save).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement afterToolCallForExportTodosPdf in src/hooks/api2ai/todo-tools/afterToolCallForExportTodosPdf.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos/export.pdf',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: true,
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: true
        }
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by the MCP host in servers/*). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
    /** MCP-only args from DSL hookParams — never sent on the HTTP request. */
    hookParams?: Record<string, unknown>;
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

export { verifyCredential } from '../../../src/hooks/api2ai/todo-tools/verifyTodoCredential.js';

export const mcpServerName = 'todo-tools';
export const mcpServerVersion = '1.2.2';

export { mcpBuildGeneratedAt } from '../mcp-build-generated-at.js';

const afterToolCallHooks: Record<
    string,
    (result: unknown, options: InvokeOptions, credential?: string) => unknown | Promise<unknown>
> = {
    listTodos: (result, options, credential) => afterToolCallForListTodos(result, options, credential!),
    exportTodosPdf: (result, options, credential) => afterToolCallForExportTodosPdf(result, options, credential!)
};

export const inputZodByTool = {
    listCategories: z
        .object({
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
            status: z
                .union([z.literal('open'), z.literal('done')])
                .describe(
                    'Optional query filter: open or done only. Omit to return all statuses. (type: string) (example: open)'
                )
                .optional(),
            categoryId: z
                .string()
                .describe(
                    'Optional query filter by category id — from listCategories categories[].id (work, home, errands). (type: string) (example: work)'
                )
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional(),
            titleContains: z
                .string()
                .describe(
                    'Optional client-side title substring filter (case-insensitive). Not an OpenAPI/API query param. (type: string) (example: Buy)'
                )
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    listTodosByCategory: z
        .object({
            categoryId: z
                .string()
                .describe(
                    'Category id (path param categoryId). Values: work, home, errands — from listCategories.\n                Do NOT use id or category. (type: string) (example: work)'
                ),
            status: z
                .union([z.literal('open'), z.literal('done')])
                .describe('Optional query filter: open or done only. (type: string) (example: open)')
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
            todoId: z
                .string()
                .describe(
                    'Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (type: string) (example: t-1)'
                ),
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
            todoId: z
                .string()
                .describe(
                    'Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (type: string) (example: t-1)'
                ),
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
            todoId: z
                .string()
                .describe(
                    'Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (type: string) (example: t-2)'
                ),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    exportTodosPdf: z
        .object({
            status: z
                .union([z.literal('open'), z.literal('done')])
                .describe(
                    'Optional query filter: open or done only. Omit to export all statuses. (type: string) (example: open)'
                )
                .optional(),
            categoryId: z
                .string()
                .describe(
                    'Optional query filter by category id — from listCategories (work, home, errands). (type: string) (example: work)'
                )
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

const invokeParamBucketsByTool = {
    listCategories: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    listTodos: {
        pathParams: [],
        query: ['status', 'categoryId'],
        headers: [],
        arrayQuery: [],
        hookParams: ['titleContains']
    },
    listTodosByCategory: {
        pathParams: ['categoryId'],
        query: ['status'],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    getTodo: {
        pathParams: ['todoId'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    createTodo: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    updateTodo: {
        pathParams: ['todoId'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    deleteTodo: {
        pathParams: ['todoId'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    exportTodosPdf: {
        pathParams: [],
        query: ['status', 'categoryId'],
        headers: [],
        arrayQuery: [],
        hookParams: []
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
            {
                pathParams?: string[];
                query?: string[];
                headers?: string[];
                arrayQuery?: string[];
                hookParams?: string[];
            }
        >
    )[toolName];
    if (!buckets) {
        return options;
    }
    const pathKeys = buckets.pathParams ?? [];
    const queryKeys = buckets.query ?? [];
    const headerKeys = buckets.headers ?? [];
    const hookKeys = buckets.hookParams ?? [];
    const arrayQueryKeys = new Set(buckets.arrayQuery ?? []);
    const hookKeySet = new Set(hookKeys);
    const knownFlatKeys = new Set([...pathKeys, ...queryKeys, ...headerKeys, ...hookKeys]);
    const collectHookParams = (): Record<string, unknown> | undefined => {
        const fromBag: Record<string, unknown> =
            options.hookParams && typeof options.hookParams === 'object' && !Array.isArray(options.hookParams)
                ? { ...options.hookParams }
                : {};
        for (const key of hookKeys) {
            if (Object.prototype.hasOwnProperty.call(options, key) && options[key as keyof InvokeOptions] != null) {
                fromBag[key] = (options as Record<string, unknown>)[key];
            }
        }
        return Object.keys(fromBag).length > 0 ? fromBag : undefined;
    };
    const hasTopLevelFlatParam = Object.keys(options).some((key) => {
        if (key === 'body' || key === 'pathParams' || key === 'headers' || key === 'hookParams') {
            return false;
        }
        if (key === 'query') {
            return queryKeys.includes('query') && !isInvokeQueryBucketValue(options.query);
        }
        return knownFlatKeys.has(key);
    });
    if (!hasTopLevelFlatParam) {
        const hookBag = collectHookParams();
        return {
            ...options,
            pathParams: omitNullishPathParams(options.pathParams),
            query: prepareQueryBucket(toolName, isInvokeQueryBucketValue(options.query) ? options.query : undefined),
            ...(hookBag ? { hookParams: hookBag } : {})
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
    const hookParams: Record<string, unknown> =
        options.hookParams && typeof options.hookParams === 'object' && !Array.isArray(options.hookParams)
            ? { ...options.hookParams }
            : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams' || key === 'hookParams') {
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
        if (hookKeySet.has(key)) {
            hookParams[key] = value;
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
        body: options.body,
        ...(Object.keys(hookParams).length > 0 ? { hookParams } : {})
    };
}
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
    deleteTodo: {},
    exportTodosPdf: {
        status: {
            style: 'form',
            explode: true
        },
        categoryId: {
            style: 'form',
            explode: true
        }
    }
};
const queryParamWireNamesByTool = {
    listCategories: {},
    listTodos: {},
    listTodosByCategory: {},
    getTodo: {},
    createTodo: {},
    updateTodo: {},
    deleteTodo: {},
    exportTodosPdf: {}
};
const pathParamWireNamesByTool = {
    listCategories: {},
    listTodos: {},
    listTodosByCategory: {},
    getTodo: {},
    createTodo: {},
    updateTodo: {},
    deleteTodo: {},
    exportTodosPdf: {}
};
const headerParamWireNamesByTool = {
    listCategories: {},
    listTodos: {},
    listTodosByCategory: {},
    getTodo: {},
    createTodo: {},
    updateTodo: {},
    deleteTodo: {},
    exportTodosPdf: {}
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
const HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT = 5242880;

function resolveHttpSuccessBodyMaxBytes(): number {
    const raw = process.env.TOOLFACTORY_HTTP_BODY_MAX_BYTES;
    if (raw === undefined || raw.trim().length === 0) {
        return HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT;
    }
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        return HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT;
    }
    return parsed;
}

function parseMimeType(contentTypeHeader: string): string {
    const raw = contentTypeHeader.split(';')[0]?.trim().toLowerCase() ?? '';
    return raw;
}

function isJsonMimeType(mime: string): boolean {
    return mime === 'application/json' || mime.endsWith('+json');
}

function isTextualMimeType(mime: string): boolean {
    if (!mime) {
        return false;
    }
    if (mime.startsWith('text/')) {
        return true;
    }
    return (
        mime === 'application/xml' ||
        mime === 'application/javascript' ||
        mime === 'application/xhtml+xml' ||
        mime === 'application/x-www-form-urlencoded'
    );
}

function parseFilenameFromContentDisposition(header: string | null): string | undefined {
    if (!header) {
        return undefined;
    }
    const star = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(header);
    if (star?.[1]) {
        try {
            return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ''));
        } catch {
            return star[1].trim().replace(/^["']|["']$/g, '');
        }
    }
    const plain = /filename=(["']?)([^"';]+)\1/i.exec(header);
    if (plain?.[2]) {
        return plain[2].trim();
    }
    return undefined;
}

function assertBodyWithinLimit(byteLength: number, toolLabel: string, maxBytes: number): void {
    if (byteLength > maxBytes) {
        throw new Error(
            'HTTP response body for ' +
                toolLabel +
                ' is ' +
                byteLength +
                ' bytes; maximum allowed is ' +
                maxBytes +
                ' bytes.'
        );
    }
}

async function decodeHttpSuccessResponse(response: Response, method: string, toolLabel: string): Promise<unknown> {
    const maxBytes = resolveHttpSuccessBodyMaxBytes();
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
        const declared = Number(contentLengthHeader);
        if (Number.isFinite(declared) && declared > maxBytes) {
            assertBodyWithinLimit(declared, toolLabel, maxBytes);
        }
    }

    if (response.status === 204 || method === 'HEAD') {
        return { kind: 'empty', status: response.status };
    }
    if (contentLengthHeader === '0') {
        return { kind: 'empty', status: response.status };
    }

    const mime = parseMimeType(response.headers.get('content-type') ?? '');

    if (isJsonMimeType(mime)) {
        const text = await response.text();
        assertBodyWithinLimit(Buffer.byteLength(text, 'utf8'), toolLabel, maxBytes);
        if (text.trim().length === 0) {
            return { kind: 'empty', status: response.status };
        }
        return JSON.parse(text) as unknown;
    }

    if (isTextualMimeType(mime)) {
        const text = await response.text();
        assertBodyWithinLimit(Buffer.byteLength(text, 'utf8'), toolLabel, maxBytes);
        if (text.trim().length === 0) {
            return { kind: 'empty', status: response.status };
        }
        return text;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    assertBodyWithinLimit(buffer.byteLength, toolLabel, maxBytes);
    if (buffer.byteLength === 0) {
        return { kind: 'empty', status: response.status };
    }
    const filename = parseFilenameFromContentDisposition(response.headers.get('content-disposition'));
    const envelope: {
        kind: 'binary';
        encoding: 'base64';
        contentType: string;
        byteLength: number;
        data: string;
        filename?: string;
    } = {
        kind: 'binary',
        encoding: 'base64',
        contentType: mime || 'application/octet-stream',
        byteLength: buffer.byteLength,
        data: buffer.toString('base64')
    };
    if (filename) {
        envelope.filename = filename;
    }
    return envelope;
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
    const optionsResolved = normalizeInvokeOptions(toolName, options);

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

    let result: unknown = await decodeHttpSuccessResponse(response, tool.method, tool.toolName);

    if (tool.hasAfterToolCall) {
        const afterToolCall = afterToolCallHooks[toolName];
        if (typeof afterToolCall !== 'function') {
            throw new Error('No afterToolCall hook for tool: ' + toolName);
        }
        if (tool.access === 'protected') {
            if (credential === undefined) {
                throw new Error('afterToolCall requires credential for protected tools.');
            }
            result = await Promise.resolve(afterToolCall(result, optionsResolved, credential));
        } else {
            result = await Promise.resolve(afterToolCall(result, optionsResolved));
        }
    }
    return result;
}
