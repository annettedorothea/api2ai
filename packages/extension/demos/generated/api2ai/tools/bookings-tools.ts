/**
 * Generated from: bookings.api2ai
 * Referenced OpenAPI: ./openapi/bookings.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import {
    verifyCredential,
    toModuleCredentials,
    type ModuleCredentials
} from '../../../src/auth/api2ai/bookings-tools/verifyBookingsCredentials.js';
import { authorizeListAllBookings } from '../../../src/auth/api2ai/bookings-tools/listAllBookings.js';
import { validateListVacationRentalsInput } from '../../../src/auth/api2ai/bookings-tools/listVacationRentals.js';
import { validateListAllBookingsInput } from '../../../src/auth/api2ai/bookings-tools/listAllBookings.js';
import { validateListBookingsInput } from '../../../src/auth/api2ai/bookings-tools/listBookings.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasAuthorize: boolean;
    hasValidate: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'listVacationRentals',
        title: 'List vacation rentals with public availability (limit validated)',
        description:
            'Intent:\nList Ferienwohnungen (vacation rental units) — public, no login.\n        Returns availability periods per unit (no guest names).\n        Query limit caps how many units are returned (default 10, max 10).\n\nAPI:\nPublic endpoint — no auth. Returns availability periods per unit (no guest identity).\nUse query limit to cap how many units are returned (max 10).\n\nMeta:\noperationId: list-vacation-rentals\n\nParameters:\n- limit (query): Query limit caps how many units are returned (default 10, max 10). (example: 10)\n\nExample:\nShow up to 10 vacation rentals and their free/occupied periods\n\nResponse:\nHTTP 200\nVacation rental units (public view)\nproperties (top-level): limit, units\n\nRuntime: implement validateListVacationRentalsInput in src/auth/api2ai/bookings-tools/listVacationRentals.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/vacation-rentals',
        access: 'public',
        hasAuthorize: false,
        hasValidate: true
    },
    {
        toolName: 'listAllBookings',
        title: 'List all customer bookings (admin only, limit validated)',
        description:
            'Intent:\nAdmin only: list bookings across all customers (Bearer JWT role=admin).\n        Query limit caps how many bookings are returned (default 10, max 10).\n        authorize + validate demo — role gate before upstream call, limit in validate stub.\n\nAPI:\nRequires Bearer JWT with role=admin. Returns bookings from all customers, capped by limit (max 10).\n\nMeta:\noperationId: list-all-bookings\n\nParameters:\n- limit (query)\n\nExample:\nList up to 10 bookings from all customers\n\nResponse:\nHTTP 200\nCross-customer booking list\nproperties (top-level): bookings, limit, role\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Admin role required\n\nRuntime: protected — implement authorizeListAllBookings and validateListAllBookingsInput in src/auth/api2ai/bookings-tools/listAllBookings.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/bookings',
        access: 'protected',
        hasAuthorize: true,
        hasValidate: true
    },
    {
        toolName: 'listBookings',
        title: 'List customer vacation rental bookings',
        description:
            'Intent:\nList bookings for the authenticated customer (Bearer JWT).\n        Path customerId is optional: when empty or omitted, filled from JWT claim customerId.\n        Role user: path customerId must match JWT; role admin may list any customerId.\n        Returns bookingId, unitId, checkIn, checkOut for each stay.\n\nAPI:\nRequires Bearer JWT; role=user path customerId must match JWT claim; admin may read any customer.\n\nMeta:\noperationId: list-customer-bookings\n\nParameters:\n- customerId (path)\n\nExample:\nList my bookings\n\nResponse:\nHTTP 200\nBooking list\nproperties (top-level): bookings, customerId\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Token customerId does not match path\n\nRuntime: protected — implement validateListBookingsInput in src/auth/api2ai/bookings-tools/listBookings.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/bookings/{customerId}',
        access: 'protected',
        hasAuthorize: false,
        hasValidate: true
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
    name: 'Authorization',
    prefix: 'Bearer '
};

export {
    verifyCredential,
    toModuleCredentials
} from '../../../src/auth/api2ai/bookings-tools/verifyBookingsCredentials.js';
export type {
    VerifyCredentialInput,
    VerifyCredentialResult,
    ModuleCredentials,
    BookingsCredentials
} from '../../../src/auth/api2ai/bookings-tools/verifyBookingsCredentials.js';

export const mcpServerName = 'bookings-tools';
export const mcpServerVersion = '0.4.1';

const authorizers: Record<string, (credentials: ModuleCredentials) => void | Promise<void>> = {
    listAllBookings: authorizeListAllBookings
};

const validators: Record<
    string,
    (options: InvokeOptions, credentials: ModuleCredentials) => InvokeOptions | Promise<InvokeOptions>
> = {
    listVacationRentals: validateListVacationRentalsInput,
    listAllBookings: validateListAllBookingsInput,
    listBookings: validateListBookingsInput
};

export const inputZodByTool = {
    listVacationRentals: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({
                    limit: z
                        .number()
                        .describe('Query limit caps how many units are returned (default 10, max 10). (example: 10)')
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
    listAllBookings: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({ limit: z.number().optional() })
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
    listBookings: z
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
        .describe('Arguments for invoking the generated HTTP wrapper.')
};

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
    const credentialsPlain = host.credentials;
    let credentialsForStubs: ModuleCredentials | undefined =
        credentialsPlain != null ? toModuleCredentials(credentialsPlain as Record<string, unknown>) : undefined;
    let optionsResolved = options;
    let authCredential = host.credential;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        if (credentialsForStubs === undefined || upstreamCredential === undefined) {
            const verified = await verifyCredential({ inboundCredential: String(inbound).trim() });
            upstreamCredential = verified.upstreamCredential;
            credentialsForStubs = verified.credentials;
        }
        authCredential = upstreamCredential ?? String(inbound).trim();
        if (tool.hasAuthorize) {
            const authorize = authorizers[toolName];
            if (typeof authorize !== 'function') {
                throw new Error('No authorizer for tool: ' + toolName);
            }
            await Promise.resolve(authorize(credentialsForStubs!));
        }
    } else if (tool.hasValidate && credentialsForStubs === undefined && credentialsPlain != null) {
        credentialsForStubs = toModuleCredentials(credentialsPlain as Record<string, unknown>);
    }
    if (tool.hasValidate) {
        const validate = validators[toolName];
        if (typeof validate !== 'function') {
            throw new Error('No validator for tool: ' + toolName);
        }
        if (credentialsForStubs === undefined) {
            if (tool.access === 'protected') {
                throw new Error('Validate requires credentials; verify credential or pass host.credentials.');
            }
            credentialsForStubs = toModuleCredentials({});
        }
        optionsResolved = await Promise.resolve(validate(options, credentialsForStubs));
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
