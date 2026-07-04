/**
 * Generated from: bookings.api2ai
 * Referenced OpenAPI: ./openapi/bookings.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { checkToolAccessForListAllBookings } from '../../../src/hooks/api2ai/bookings-tools/listAllBookings.js';
import { checkToolAccessForListBookings } from '../../../src/hooks/api2ai/bookings-tools/listBookings.js';
import { prepareToolCallForListVacationRentals } from '../../../src/hooks/api2ai/bookings-tools/listVacationRentals.js';
import { prepareToolCallForListAllBookings } from '../../../src/hooks/api2ai/bookings-tools/listAllBookings.js';
import { prepareToolCallForListBookings } from '../../../src/hooks/api2ai/bookings-tools/listBookings.js';

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
        toolName: 'listVacationRentals',
        title: 'List vacation rentals with public availability (limit validated)',
        description:
            'Intent:\nList Ferienwohnungen (vacation rental units) — public, no login.\n        Returns availability periods per unit (no guest names).\n        Query limit caps how many units are returned (default 10, max 10).\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nPublic endpoint — no auth. Returns availability periods per unit (no guest identity).\nUse query limit to cap how many units are returned (max 10).\n\nMeta:\noperationId: list-vacation-rentals\n\nParameters:\n- limit (query): Query limit caps how many units are returned (default 10, max 10). (example: 10)\n\nExample:\nShow up to 10 vacation rentals and their free/occupied periods\n\nResponse:\nHTTP 200\nVacation rental units (public view)\nproperties (top-level): limit, units\n\nRuntime: implement prepareToolCallForListVacationRentals in src/hooks/api2ai/bookings-tools/listVacationRentals.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/vacation-rentals',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: true
    },
    {
        toolName: 'listAllBookings',
        title: 'List all customer bookings (admin only, limit validated)',
        description:
            'Intent:\nAdmin only: list bookings across all customers (Bearer JWT role=admin).\n        Query limit caps how many bookings are returned (default 10, max 10).\n        checkToolAccess + prepareToolCall demo — role gate before upstream call, limit in prepare stub.\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nRequires Bearer JWT with role=admin. Returns bookings from all customers, capped by limit (max 10).\n\nMeta:\noperationId: list-all-bookings\n\nParameters:\n- limit (query)\n\nExample:\nList up to 10 bookings from all customers\n\nResponse:\nHTTP 200\nCross-customer booking list\nproperties (top-level): bookings, limit, role\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Admin role required\n\nRuntime: protected — implement checkToolAccessForListAllBookings and prepareToolCallForListAllBookings in src/hooks/api2ai/bookings-tools/listAllBookings.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/bookings',
        access: 'protected',
        hasCheckToolAccess: true,
        hasPrepareToolCall: true
    },
    {
        toolName: 'listBookings',
        title: 'List customer vacation rental bookings',
        description:
            'Intent:\nList bookings for the authenticated customer (Bearer JWT).\n        Path customerId is optional: when empty or omitted, filled from JWT claim customerId.\n        Role user: path customerId must match JWT; role admin may list any customerId.\n        Returns bookingId, unitId, checkIn, checkOut for each stay.\n\nMCP arguments:\npass customerId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nRequires Bearer JWT; role=user path customerId must match JWT claim; admin may read any customer.\n\nMeta:\noperationId: list-customer-bookings\n\nParameters:\n- customerId (path)\n\nExample:\nList my bookings\n\nResponse:\nHTTP 200\nBooking list\nproperties (top-level): bookings, customerId\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Token customerId does not match path\n\nRuntime: protected — implement checkToolAccessForListBookings and prepareToolCallForListBookings in src/hooks/api2ai/bookings-tools/listBookings.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/bookings/{customerId}',
        access: 'protected',
        hasCheckToolAccess: true,
        hasPrepareToolCall: true
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
    name: 'Authorization',
    prefix: 'Bearer '
};

export const mcpServerName = 'bookings-tools';
export const mcpServerVersion = '0.5.0';

const checkToolAccessHooks: Record<string, (credential: string) => void | Promise<void>> = {
    listAllBookings: checkToolAccessForListAllBookings,
    listBookings: checkToolAccessForListBookings
};

const prepareToolCallHooks: Record<
    string,
    (options: InvokeOptions, credential?: string) => InvokeOptions | Promise<InvokeOptions>
> = {
    listVacationRentals: prepareToolCallForListVacationRentals,
    listAllBookings: (options, credential) => prepareToolCallForListAllBookings(options, credential!),
    listBookings: (options, credential) => prepareToolCallForListBookings(options, credential!)
};

export const inputZodByTool = {
    listVacationRentals: z
        .object({
            limit: z
                .union([z.number().int(), z.string()])
                .describe('Query limit caps how many units are returned (default 10, max 10). (example: 10)')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    listAllBookings: z
        .object({
            limit: z.union([z.number().int(), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    listBookings: z
        .object({
            customerId: z.string().optional(),
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
    listVacationRentals: {
        pathParams: [],
        query: ['limit'],
        headers: [],
        arrayQuery: []
    },
    listAllBookings: {
        pathParams: [],
        query: ['limit'],
        headers: [],
        arrayQuery: []
    },
    listBookings: {
        pathParams: ['customerId'],
        query: [],
        headers: [],
        arrayQuery: []
    }
};
const invokeBodySchemaByTool = {};

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
    listVacationRentals: {
        limit: {
            style: 'form',
            explode: true
        }
    },
    listAllBookings: {
        limit: {
            style: 'form',
            explode: true
        }
    },
    listBookings: {}
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
    let optionsResolved = normalizeInvokeOptions(toolName, options);

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let credential: string | undefined = host.credential?.trim() ? String(host.credential).trim() : undefined;
    let authCredential: string | undefined = credential;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        credential = String(inbound).trim();
        if (tool.hasCheckToolAccess) {
            const checkToolAccess = checkToolAccessHooks[toolName];
            if (typeof checkToolAccess !== 'function') {
                throw new Error('No checkToolAccess hook for tool: ' + toolName);
            }
            await Promise.resolve(checkToolAccess(credential));
        }
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
