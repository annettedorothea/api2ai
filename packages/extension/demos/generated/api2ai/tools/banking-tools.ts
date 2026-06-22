/**
 * Generated from: banking.api2ai
 * Referenced OpenAPI: ./openapi/banking-api.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import {
    verifyCredential,
    toModuleCredentials,
    type ModuleCredentials
} from '../../../src/auth/api2ai/banking-tools/verifyBankingCredentials.js';
import { authorizeListCustomers } from '../../../src/auth/api2ai/banking-tools/listCustomers.js';
import { validateListAccountsInput } from '../../../src/auth/api2ai/banking-tools/listAccounts.js';
import { validateListTransactionsInput } from '../../../src/auth/api2ai/banking-tools/listTransactions.js';

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
        toolName: 'listCustomers',
        title: 'List all bank customers (admin only)',
        description:
            'Intent:\nList all bank customers (admin only). Requires opaque API Bearer token with role=admin.\n        MCP authorize gate runs before the upstream call; users with role=user are rejected.\n\nAPI:\nRequires opaque API Bearer token with admin role.\n\nMeta:\noperationId: list-customers\n\nExample:\nList all customers in the banking directory\n\nResponse:\nHTTP 200 — top-level role, customers array. Each customer: customerId, displayName.\n        Documented errors:\n        HTTP 401 — Missing or invalid token\n        HTTP 403 — Admin role required\n\nRuntime: protected — implement authorizeListCustomers in src/auth/api2ai/banking-tools/listCustomers.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/customers',
        access: 'protected',
        hasAuthorize: true,
        hasValidate: false
    },
    {
        toolName: 'listAccounts',
        title: 'List customer bank accounts',
        description:
            'Intent:\nList bank accounts for the authenticated customer. Omitted customerId is filled from the token claim.\n\nAPI:\nRequires opaque API Bearer token. Role=user path customerId must match token claim; admin may read any customer.\n\nMeta:\noperationId: list-customer-accounts\n\nParameters:\n- customerId (path)\n\nExample:\nList my bank accounts\n\nResponse:\nHTTP 200 — top-level customerId, role, accounts array. Each account: accountId, type, iban, balance, currency.\n        Use accounts[].accountId for listTransactions (e.g. acc-alice-checking).\n        Documented errors:\n        HTTP 401 — Missing or invalid token\n        Parameter check: role=user rejects customerId that does not match the token claim (before upstream call).\n\nRuntime: protected — implement validateListAccountsInput in src/auth/api2ai/banking-tools/listAccounts.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/accounts/{customerId}',
        access: 'protected',
        hasAuthorize: false,
        hasValidate: true
    },
    {
        toolName: 'listTransactions',
        title: 'List account transactions',
        description:
            'Intent:\nList transactions for one account. Omitted customerId is filled from the token claim.\n        Requires opaque API Bearer token (IdP JWT is rejected upstream).\n\nAPI:\nRequires opaque API Bearer token. Role=user path customerId must match token claim; admin may read any customer.\n\nMeta:\noperationId: list-account-transactions\n\nParameters:\n- accountId (path)\n- customerId (path)\n\nExample:\nShow transactions for acc-alice-checking\n\nResponse:\nHTTP 200 — top-level accountId, customerId, transactions array. Each: transactionId, date, description, amount, currency.\n        Documented errors:\n        HTTP 401 — Missing or invalid token\n        HTTP 404 — Account not found\n        Parameter check: role=user rejects customerId that does not match the token claim (before upstream call).\n\nRuntime: protected — implement validateListTransactionsInput in src/auth/api2ai/banking-tools/listTransactions.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/accounts/{customerId}/{accountId}/transactions',
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
} from '../../../src/auth/api2ai/banking-tools/verifyBankingCredentials.js';
export type {
    VerifyCredentialInput,
    VerifyCredentialResult,
    ModuleCredentials,
    BankingCredentials
} from '../../../src/auth/api2ai/banking-tools/verifyBankingCredentials.js';

export const mcpServerName = 'banking-tools';
export const mcpServerVersion = '0.4.0';

const authorizers: Record<string, (credentials: ModuleCredentials) => void | Promise<void>> = {
    listCustomers: authorizeListCustomers
};

const validators: Record<
    string,
    (options: InvokeOptions, credentials: ModuleCredentials) => InvokeOptions | Promise<InvokeOptions>
> = {
    listAccounts: validateListAccountsInput,
    listTransactions: validateListTransactionsInput
};

export const inputZodByTool = {
    listCustomers: z
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
    listAccounts: z
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
    listTransactions: z
        .object({
            pathParams: z
                .object({ customerId: z.string().optional(), accountId: z.string() })
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
    listCustomers: {},
    listAccounts: {},
    listTransactions: {}
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
