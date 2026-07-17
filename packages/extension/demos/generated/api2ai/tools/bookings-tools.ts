/**
 * Generated from: bookings.api2ai
 * Referenced OpenAPI: ./openapi/bookings.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { checkToolAccessForListAllBookings } from '../../../src/hooks/api2ai/bookings-tools/checkToolAccessForListAllBookings.js';
import { checkToolAccessForListBookings } from '../../../src/hooks/api2ai/bookings-tools/checkToolAccessForListBookings.js';
import { prepareToolCallForListVacationRentals } from '../../../src/hooks/api2ai/bookings-tools/prepareToolCallForListVacationRentals.js';
import { prepareToolCallForListAllBookings } from '../../../src/hooks/api2ai/bookings-tools/prepareToolCallForListAllBookings.js';
import { prepareToolCallForListBookings } from '../../../src/hooks/api2ai/bookings-tools/prepareToolCallForListBookings.js';

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
            'Intent:\nList Ferienwohnungen (vacation rental units) — public, no login.\n        Returns availability periods per unit (no guest names).\n        Query limit caps how many units are returned (default 10, max 10).\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nPublic endpoint — no auth. Returns availability periods per unit (no guest identity).\nUse query limit to cap how many units are returned (max 10).\n\nMeta:\noperationId: list-vacation-rentals\n\nParameters:\n- limit (query): Query limit caps how many units are returned (default 10, max 10). (type: integer) (example: 10)\n\nExample:\nShow up to 10 vacation rentals and their free/occupied periods\n\nResponse:\nHTTP 200\nVacation rental units (public view)\nproperties (top-level): limit, units\n\nRuntime: implement prepareToolCallForListVacationRentals in src/hooks/api2ai/bookings-tools/prepareToolCallForListVacationRentals.ts (types from this tools module; run build:generated for .js).',
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
            'Intent:\nAdmin only: list bookings across all customers (Bearer JWT role=admin).\n        Query limit caps how many bookings are returned (default 10, max 10).\n        checkToolAccess + prepareToolCall demo — role gate before upstream call, limit in prepare stub.\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nRequires Bearer JWT with role=admin. Returns bookings from all customers, capped by limit (max 10).\n\nMeta:\noperationId: list-all-bookings\n\nParameters:\n- limit (query): (type: integer)\n\nExample:\nList up to 10 bookings from all customers\n\nResponse:\nHTTP 200\nCross-customer booking list\nproperties (top-level): bookings, limit, role\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Admin role required\n\nRuntime: protected — implement checkToolAccessForListAllBookings in src/hooks/api2ai/bookings-tools/checkToolAccessForListAllBookings.ts and prepareToolCallForListAllBookings in src/hooks/api2ai/bookings-tools/prepareToolCallForListAllBookings.ts; credential sent as header "Authorization" (prefix applied to the secret).',
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
            'Intent:\nList bookings for the authenticated customer (Bearer JWT).\n        Path customerId is optional: when empty or omitted, filled from JWT claim customerId.\n        Role user: path customerId must match JWT; role admin may list any customerId.\n        Returns bookingId, unitId, checkIn, checkOut for each stay.\n\nMCP arguments:\npass customerId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nRequires Bearer JWT; role=user path customerId must match JWT claim; admin may read any customer.\n\nMeta:\noperationId: list-customer-bookings\n\nParameters:\n- customerId (path): (type: string)\n\nExample:\nList my bookings\n\nResponse:\nHTTP 200\nBooking list\nproperties (top-level): bookings, customerId\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Token customerId does not match path\n\nRuntime: protected — implement checkToolAccessForListBookings in src/hooks/api2ai/bookings-tools/checkToolAccessForListBookings.ts and prepareToolCallForListBookings in src/hooks/api2ai/bookings-tools/prepareToolCallForListBookings.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/bookings/{customerId}',
        access: 'protected',
        hasCheckToolAccess: true,
        hasPrepareToolCall: true
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
    name: 'Authorization',
    prefix: 'Bearer '
};

export const mcpServerName = 'bookings-tools';
export const mcpServerVersion = '1.0.1';

export { mcpBuildGeneratedAt } from '../mcp-build-generated-at.js';

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
                .number()
                .int()
                .describe(
                    'Query limit caps how many units are returned (default 10, max 10). (type: integer) (example: 10)'
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
    listAllBookings: z
        .object({
            limit: z.number().int().optional(),
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
const queryParamWireNamesByTool = {
    listVacationRentals: {},
    listAllBookings: {},
    listBookings: {}
};
const pathParamWireNamesByTool = {
    listVacationRentals: {},
    listAllBookings: {},
    listBookings: {}
};
const headerParamWireNamesByTool = {
    listVacationRentals: {},
    listAllBookings: {},
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
