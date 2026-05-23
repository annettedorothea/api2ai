/**
 * Generated from: mock-api.api2ai
 * Referenced OpenAPI: ./openapi/mock-api.openapi.yaml
 */

export const insecureTls = false;

export const generatedTools = [
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

export const requiresAuth = true;

export const authConfig = {
    "location": "header",
    "name": "Authorization",
    "prefix": "Bearer ",
    "fromJwt": "customerId"
};

export const inputSchemaByTool = {
    "listCustomerOrders": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "additionalProperties": true,
                "description": "Optional query overrides."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "login": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "customerId": {
                        "type": "string"
                    }
                },
                "required": [
                    "customerId"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "additionalProperties": true,
                "description": "Optional query overrides."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
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

function decodeJwtPayload(token) {
    const parts = String(token).trim().split('.');
    if (parts.length !== 3) {
        throw new Error('fromJwt: credential is not a JWT (expected three dot-separated segments).');
    }
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

function resolvePathParamsWithFromJwt(authConfig, options) {
    const base = { ...(options.pathParams ?? {}) };
    const claim = authConfig?.fromJwt;
    if (!claim) {
        return base;
    }
    const credential = options?.credential;
    if (!credential || !String(credential).trim()) {
        throw new Error('fromJwt requires InvokeOptions.credential (MCP host --auth-env).');
    }
    const payload = decodeJwtPayload(credential);
    const value = payload[claim];
    if (value === undefined || value === null || String(value).trim() === '') {
        throw new Error('fromJwt: JWT payload missing claim "' + claim + '".');
    }
    base[claim] = String(value).trim();
    return base;
}

function resolveAuthSecret(authConfig, options) {
    const secret = options?.credential;
    if (!secret || !String(secret).trim()) {
        throw new Error('Missing API credential (MCP host must pass InvokeOptions.credential from --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(secret).trim();
}

export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    if (!options.baseUrl || !String(options.baseUrl).trim()) {
        throw new Error('Missing baseUrl (MCP host must pass InvokeOptions.baseUrl from --base-url-env).');
    }
    const effectiveBaseUrl = String(options.baseUrl).trim();
    const normalizedBaseUrl = effectiveBaseUrl.endsWith('/') ? effectiveBaseUrl.slice(0, -1) : effectiveBaseUrl;
    const pathParams = !tool.public && authConfig?.fromJwt
        ? resolvePathParamsWithFromJwt(authConfig, options)
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
        const authValue = resolveAuthSecret(authConfig, options);
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
                    ' Check MCP host --auth-env and the configured environment variable (' +
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
