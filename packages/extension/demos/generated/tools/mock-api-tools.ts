/**
 * Generated from: mock-api.api2ai
 * Referenced OpenAPI: ./openapi/mock-api.openapi.yaml
 */

export const insecureTls = false;

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
    /** When true, no auth header or fromJwt binding (e.g. login). */
    public?: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        "toolName": "listCustomerOrders",
        "title": "List customer orders",
        "description": "Intent:\nlist orders for the authenticated customer from the JWT\n\nAPI:\nRequires Bearer JWT; customerId in path must match JWT claim.\n\nMeta:\noperationId: list-customer-orders\n\nExample:\nList my orders\n\nResponse:\nHTTP 200\nOrder list\nproperties (top-level): customerId, orders\nDocumented errors:\nHTTP 401 — Missing or invalid token\nHTTP 403 — Token customerId does not match path\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret). Path parameter \"customerId\" is derived from that JWT claim; do not pass it in tool arguments.",
        "method": "GET",
        "path": "/orders/{customerId}",
        "example": "List my orders",
        "public": false
    },
    {
        "toolName": "login",
        "title": "Login customer",
        "description": "Intent:\nlogin the customer\n\nAPI:\nIssues a short-lived HS256 JWT with claim customerId. No authentication required.\n\nMeta:\noperationId: login-customer\n\nExample:\nLogin\n\nResponse:\nHTTP 200\nAccess token\nproperties (top-level): access_token\nDocumented errors:\nHTTP 404 — Unknown customer\n\nRuntime: public endpoint — no Authorization header or MCP credential required.",
        "method": "POST",
        "path": "/login/{customerId}",
        "example": "Login",
        "public": true
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (not visible to the agent: host context via mcpHostAdapter). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
    fromJwt?: string;
};

export const requiresAuth = true;
export const authConfig: AuthConfig | undefined = {
    "location": "header",
    "name": "Authorization",
    "prefix": "Bearer ",
    "fromJwt": "customerId"
};

export const mcpServerName = "mock-api-tools";
export const mcpServerVersion = "0.0.1";

import * as z from 'zod/v4';

const __api2aiPrimitiveUnion = z.union([z.string(), z.number(), z.boolean()]);
const __api2aiQueryValueUnion = z.union([__api2aiPrimitiveUnion, z.array(__api2aiPrimitiveUnion)]);

export const inputZodByTool = {
    "listCustomerOrders": z.object({ "pathParams": z.record(z.string(), __api2aiPrimitiveUnion).describe("No path parameters.").optional(), "query": z.record(z.string(), __api2aiPrimitiveUnion).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "login": z.object({ "pathParams": z.object({ "customerId": z.string() }).strict().describe("Path parameters from OpenAPI."), "query": z.record(z.string(), __api2aiPrimitiveUnion).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper.")
};

const META_BASE_URL_ENV_KEY = 'MCP_HOST_BASE_URL_ENV_KEY';
const META_AUTH_ENV_KEY = 'MCP_HOST_AUTH_ENV_KEY';
const META_ENV_DIRS = 'MCP_HOST_ENV_DIRS';

function applyHostEnvKeys(hostConfig, envDirs) {
    process.env[META_BASE_URL_ENV_KEY] = hostConfig.baseUrlEnv;
    if (hostConfig.authEnv) {
        process.env[META_AUTH_ENV_KEY] = hostConfig.authEnv;
    } else {
        delete process.env[META_AUTH_ENV_KEY];
    }
    if (envDirs.length > 0) {
        process.env[META_ENV_DIRS] = JSON.stringify(envDirs);
    } else {
        delete process.env[META_ENV_DIRS];
    }
}

function decodeJwtPayloadUnsafe(token) {
    const parts = String(token).trim().split('.');
    if (parts.length !== 3) {
        throw new Error('credential is not a JWT (expected three dot-separated segments).');
    }
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

export const mcpHostAdapter = {
    configureFromArgv(argv, envDirs) {
        let baseUrlEnv;
        let authEnv;
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (arg === '--base-url-env') {
                baseUrlEnv = argv[++i];
                if (!baseUrlEnv) {
                    throw new Error('Missing value after --base-url-env');
                }
                continue;
            }
            if (arg === '--auth-env') {
                authEnv = argv[++i];
                if (!authEnv) {
                    throw new Error('Missing value after --auth-env');
                }
                continue;
            }
            if (arg.startsWith('-')) {
                throw new Error('Unknown option: ' + arg);
            }
            throw new Error('Unexpected positional argument: ' + arg);
        }
        if (!baseUrlEnv) {
            throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
        }
        applyHostEnvKeys({ baseUrlEnv, authEnv }, envDirs);
    },

    validateAtStartup(requiresAuth) {
        const baseUrlEnvName = process.env[META_BASE_URL_ENV_KEY]?.trim();
        if (!baseUrlEnvName) {
            throw new Error('Host base URL env key is not configured.');
        }
        const baseUrl = process.env[baseUrlEnvName]?.trim();
        if (!baseUrl) {
            throw new Error(
                'Environment variable "' + baseUrlEnvName + '" is missing or empty (required by --base-url-env).'
            );
        }
        if (!requiresAuth) {
            return;
        }
        const authEnvName = process.env[META_AUTH_ENV_KEY]?.trim();
        if (!authEnvName) {
            throw new Error('Generated tools require auth; pass --auth-env <ENV_VAR_NAME> on the MCP host.');
        }
        const credential = process.env[authEnvName]?.trim();
        if (!credential) {
            throw new Error(
                'Environment variable "' + authEnvName + '" is missing or empty (required by --auth-env).'
            );
        }
    },

    resolveHostContext() {
        const baseUrlKey = process.env[META_BASE_URL_ENV_KEY]?.trim();
        const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
        if (!baseUrl) {
            throw new Error(
                'Missing host base URL. Pass --base-url-env on mcp-serve.mjs and set the variable (or use smoke-generated).'
            );
        }

        const authKey = process.env[META_AUTH_ENV_KEY]?.trim();
        let credential = authKey ? process.env[authKey]?.trim() : undefined;
        if (!credential) {
            throw new Error(
                'Missing host credential. Pass --auth-env on mcp-serve.mjs and set the variable (re-read on every tool call).'
            );
        }

        let jwt;
        if (credential) {
            const segments = String(credential).trim().split('.');
            if (segments.length === 3) {
                try {
                    jwt = decodeJwtPayloadUnsafe(credential);
                } catch {
                    jwt = undefined;
                }
            }
        }

        return { baseUrl, credential, jwt };
    },

    envDirsForReload() {
        const raw = process.env[META_ENV_DIRS];
        if (!raw?.trim()) {
            return [];
        }
        try {
            const dirs = JSON.parse(raw);
            if (Array.isArray(dirs) && dirs.every((d) => typeof d === 'string')) {
                return dirs;
            }
        } catch {
            // ignore malformed config
        }
        return [];
    }
};

export const queryParamSerializationByTool = {
    "listCustomerOrders": {},
    "login": {}
};

function appendSerializedQueryParams(searchParams, toolName, query) {
    if (!query) {
        return;
    }
    const hintsByParam = queryParamSerializationByTool[toolName] ?? {};
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
            const parts = [];
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

function resolvePathParamsWithFromJwt(authConfig, pathParams, jwt) {
    const base = { ...(pathParams ?? {}) };
    const claim = authConfig?.fromJwt;
    if (!claim) {
        return base;
    }
    if (!jwt || typeof jwt !== 'object') {
        throw new Error('fromJwt requires a JWT in host context (set --auth-env to a JWT).');
    }
    const value = jwt[claim];
    if (value === undefined || value === null || String(value).trim() === '') {
        throw new Error('fromJwt: JWT payload missing claim "' + claim + '".');
    }
    base[claim] = String(value).trim();
    return base;
}

function resolveAuthSecret(authConfig, credential) {
    if (!credential || !String(credential).trim()) {
        throw new Error('Missing host credential (MCP host --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}

export async function invokeTool(toolName, options = {}, hostContext) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const host = hostContext ?? mcpHostAdapter.resolveHostContext();
    const { baseUrl, credential, jwt } = host;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = !tool.public && authConfig?.fromJwt
        ? resolvePathParamsWithFromJwt(authConfig, options.pathParams, jwt)
        : { ...(options.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, options.query);
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };
    if (authConfig && !tool.public) {
        const authValue = resolveAuthSecret(authConfig, credential);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };

    if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            bodySnippet = '';
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            if (authConfig && !tool.public) {
                msg +=
                    ' Check MCP host --auth-env (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
            } else if (!tool.public) {
                msg += ' The API may require authentication.';
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
