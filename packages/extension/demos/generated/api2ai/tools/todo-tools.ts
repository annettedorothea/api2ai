/**
 * Generated from: todo.api2ai
 * Referenced OpenAPI: ./openapi/todo-api.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/todo-tools/verifyTodoCredential.js';

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
        toolName: 'listCategories',
        title: 'List todo categories',
        description:
            'Intent:\nList todo categories before createTodo or when filtering by categoryId.\n        Response categories[].id values: work, home, errands.\n\nMeta:\noperationId: list-categories\n\nExample:\nList todo categories\n\nResponse:\nHTTP 200 — top-level categories array. Each category: id, name, color (ids: work, home, errands).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'listTodos',
        title: 'List todos',
        description:
            'Intent:\nList todos. Optional query filters: status (open|done), categoryId (work|home|errands).\n        Use todos[].id (e.g. t-1) as todoId for getTodo, updateTodo, deleteTodo.\n        Call shape: query optional only — e.g. { "status": "open" } or {} for all todos.\n\nMCP arguments:\npass status, categoryId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: list-todos\n\nParameters:\n- categoryId (query): Optional query filter by category id — from listCategories categories[].id (work, home, errands). (example: work)\n- status (query): Optional query filter: open or done only. Omit to return all statuses. (example: open)\n\nExample:\nList all todos\n\nResponse:\nHTTP 200 — top-level todos array. Each todo: id, title, status (open|done), categoryId, dueDate.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'listTodosByCategory',
        title: 'List todos by category',
        description:
            'Intent:\nList todos in one category. categoryId is a path param (work, home, or errands).\n        Optional status: open or done.\n        Call shape: categoryId required; status optional.\n\nMCP arguments:\npass categoryId, status as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: list-todos-by-category\n\nParameters:\n- categoryId (path): Category id (path param categoryId). Values: work, home, errands — from listCategories.\n                Do NOT use id or category. (example: work)\n- status (query): Optional query filter: open or done only. (example: open)\n\nExample:\nList open todos in category work\n\nResponse:\nHTTP 200 — top-level categoryId and todos array (same todo shape as listTodos).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Unknown category (invalid categoryId)\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/categories/{categoryId}/todos',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTodo',
        title: 'Get todo by id',
        description:
            'Intent:\nFetch one todo by id. Get todoId from listTodos todos[].id or createTodo todo.id.\n        Call shape: todoId required — e.g. { "todoId": "t-1" }.\n        Do NOT use id.\n\nMCP arguments:\npass todoId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: get-todo\n\nParameters:\n- todoId (path): Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (example: t-1)\n\nExample:\nGet todo t-1\n\nResponse:\nHTTP 200 — top-level property todo (id, title, status, categoryId, dueDate).\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'GET',
        path: '/todos/{todoId}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
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
        hasPrepareToolCall: false
    },
    {
        toolName: 'updateTodo',
        title: 'Update todo',
        description:
            'Intent:\nUpdate a todo. Requires todoId from listTodos todos[].id (e.g. t-1) and body with at least one field.\n        Do NOT use id — the path key is todoId.\n        Example — mark done: { "todoId": "t-1" }, body: { "status": "done" }.\n        Example — rename: { "todoId": "t-2" }, body: { "title": "Buy organic milk" }.\n\nMCP arguments:\npass todoId as top-level tool arguments; send the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: update-todo\n\nParameters:\n- todoId (path): Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (example: t-1)\n\nRequest body:\nJSON body object (required). Send only fields to change; at least one required.\n        Fields: status (open|done), title (string), categoryId (work|home|errands), dueDate (YYYY-MM-DD).\n        Do not send id in body.\n        Example mark done: { "status": "done" }\n        Example reopen: { "status": "open" }\n\nExample:\nMark todo t-1 as done\n\nResponse:\nHTTP 200 — top-level property todo with updated fields.\n        Documented errors:\n        HTTP 400 — Invalid input\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo or category not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'PATCH',
        path: '/todos/{todoId}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'deleteTodo',
        title: 'Delete todo',
        description:
            'Intent:\nDelete a todo permanently. Requires todoId from listTodos todos[].id.\n        Do NOT use id.\n        Call shape: { "todoId": "t-2" } — no body required.\n\nMCP arguments:\npass todoId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: delete-todo\n\nParameters:\n- todoId (path): Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (example: t-2)\n\nExample:\nDelete todo t-2\n\nResponse:\nHTTP 200 — top-level todoId and deleted: true.\n        Documented errors:\n        HTTP 401 — Missing or invalid API key\n        HTTP 404 — Todo not found\n\nRuntime: protected — implement src/hooks/api2ai/todo-tools/verifyTodoCredential.ts; credential sent as header "x-api-key".',
        method: 'DELETE',
        path: '/todos/{todoId}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
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
export const mcpServerVersion = '0.5.0';

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
                .describe('Optional query filter: open or done only. Omit to return all statuses. (example: open)')
                .optional(),
            categoryId: z
                .string()
                .describe(
                    'Optional query filter by category id — from listCategories categories[].id (work, home, errands). (example: work)'
                )
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
            categoryId: z
                .string()
                .describe(
                    'Category id (path param categoryId). Values: work, home, errands — from listCategories.\n                Do NOT use id or category. (example: work)'
                ),
            status: z
                .union([z.literal('open'), z.literal('done')])
                .describe('Optional query filter: open or done only. (example: open)')
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
                    'Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (example: t-1)'
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
                    'Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (example: t-1)'
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
                    'Todo id as todoId (NOT id). From listTodos todos[].id or createTodo todo.id. (example: t-2)'
                ),
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
        arrayQuery: []
    },
    listTodos: {
        pathParams: [],
        query: ['status', 'categoryId'],
        headers: [],
        arrayQuery: []
    },
    listTodosByCategory: {
        pathParams: ['categoryId'],
        query: ['status'],
        headers: [],
        arrayQuery: []
    },
    getTodo: {
        pathParams: ['todoId'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    createTodo: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    updateTodo: {
        pathParams: ['todoId'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    deleteTodo: {
        pathParams: ['todoId'],
        query: [],
        headers: [],
        arrayQuery: []
    }
};
const invokeBodySchemaByTool = {
    createTodo: {
        type: 'object',
        properties: {
            title: {
                type: 'string'
            },
            categoryId: {
                type: 'string'
            },
            status: {
                enum: ['open', 'done'],
                type: 'string'
            },
            dueDate: {
                type: 'string'
            }
        },
        required: ['title', 'categoryId'],
        additionalProperties: false
    },
    updateTodo: {
        type: 'object',
        properties: {
            title: {
                type: 'string'
            },
            status: {
                enum: ['open', 'done'],
                type: 'string'
            },
            categoryId: {
                type: 'string'
            },
            dueDate: {
                type: 'string'
            }
        },
        required: [],
        additionalProperties: false
    }
};

function coerceInvokeScalar(value: string | number | boolean): string | number | boolean {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === 'true') {
            return true;
        }
        if (trimmed === 'false') {
            return false;
        }
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            const parsed = Number(trimmed);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }
    return value;
}

function coerceInvokePathBucket(
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
        out[key] = coerceInvokeScalar(value);
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function coerceInvokeQueryArrayValue(value: string): ReadonlyArray<string | number | boolean> {
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => coerceInvokeScalar(part));
}

function coerceInvokeQueryBucket(toolName: string, bucket: InvokeOptions['query']): InvokeOptions['query'] {
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
        if (Array.isArray(value)) {
            out[key] = value.map((element) => coerceInvokeScalar(element));
            continue;
        }
        if (arrayQueryKeys.has(key) && typeof value === 'string') {
            out[key] = coerceInvokeQueryArrayValue(value);
            continue;
        }
        out[key] = coerceInvokeScalar(value as string | number | boolean);
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function coerceInvokeValueBySchema(value: unknown, schema: Record<string, unknown> | undefined): unknown {
    if (!schema || value === undefined || value === null) {
        return value;
    }
    const type = schema.type;
    if (type === 'integer' || type === 'number') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return coerceInvokeScalar(value as string | number | boolean);
        }
        return value;
    }
    if (type === 'boolean') {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === 'true') {
                return true;
            }
            if (trimmed === 'false') {
                return false;
            }
        }
        return value;
    }
    if (type === 'array') {
        const items = schema.items as Record<string, unknown> | undefined;
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((part) => part.trim())
                .filter((part) => part.length > 0)
                .map((part) => (items ? coerceInvokeValueBySchema(part, items) : coerceInvokeScalar(part)));
        }
        if (Array.isArray(value)) {
            return value.map((element) =>
                items
                    ? coerceInvokeValueBySchema(element, items)
                    : coerceInvokeScalar(element as string | number | boolean)
            );
        }
        return value;
    }
    if (
        type === 'object' &&
        schema.properties &&
        typeof schema.properties === 'object' &&
        !Array.isArray(schema.properties) &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    ) {
        const props = schema.properties as Record<string, Record<string, unknown>>;
        const out: Record<string, unknown> = {};
        for (const [key, element] of Object.entries(value as Record<string, unknown>)) {
            if (element === undefined || element === null) {
                continue;
            }
            const propSchema = props[key];
            out[key] = propSchema ? coerceInvokeValueBySchema(element, propSchema) : element;
        }
        return out;
    }
    return value;
}

function coerceInvokeBody(toolName: string, body: unknown): unknown {
    if (body === undefined || body === null) {
        return body;
    }
    const schema = (invokeBodySchemaByTool as Record<string, Record<string, unknown> | undefined>)[toolName];
    if (!schema) {
        return body;
    }
    return coerceInvokeValueBySchema(body, schema);
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
    const hasTopLevelFlatParam = Object.keys(options).some(
        (key) =>
            key !== 'body' && key !== 'headers' && key !== 'pathParams' && key !== 'query' && knownFlatKeys.has(key)
    );
    if (!hasTopLevelFlatParam) {
        return {
            ...options,
            pathParams: coerceInvokePathBucket(options.pathParams),
            query: coerceInvokeQueryBucket(toolName, options.query),
            body: coerceInvokeBody(toolName, options.body)
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {
        ...(options.query ?? {})
    };
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams' || key === 'query') {
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
                query[key] = coerceInvokeQueryArrayValue(value);
            } else {
                query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
            }
        } else if (headerKeys.includes(key)) {
            headers[key] = String(value);
        }
    }

    return {
        pathParams: coerceInvokePathBucket(pathParams),
        query: coerceInvokeQueryBucket(toolName, query),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: coerceInvokeBody(toolName, options.body)
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
    const optionsResolved = normalizeInvokeOptions(toolName, options);

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let authCredential: string | undefined = host.credential?.trim() ? String(host.credential).trim() : undefined;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        const credential = String(inbound).trim();
        await verifyCredential(credential);
        authCredential = credential;
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
