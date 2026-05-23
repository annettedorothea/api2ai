/**
 * Generated from: open-meteo-geocoding.api2ai
 * Referenced OpenAPI: ./openapi/open-meteo-geocoding.openapi.yaml
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
        "toolName": "openMeteoGeocodeSearch",
        "title": "Resolve location names to coordinates",
        "description": "Intent:\nresolve a location name to latitude and longitude coordinates\n\nMeta:\noperationId: searchLocationByName\n\nExample:\nFind coordinates for Bernstein, Burgenland, Austria\n\nResponse:\nHTTP 200\nOK",
        "method": "GET",
        "path": "/v1/search",
        "example": "Find coordinates for Bernstein, Burgenland, Austria",
        "public": false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (not visible to the agent: host base URL, credential, JWT via resolveHostContext). */
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

export const requiresAuth = false;
export const authConfig: AuthConfig | undefined = undefined;

export const mcpServerName = "open-meteo-geocoding-tools";
export const mcpServerVersion = "0.0.1";

import * as z from 'zod/v4';

const __api2aiPrimitiveUnion = z.union([z.string(), z.number(), z.boolean()]);
const __api2aiQueryValueUnion = z.union([__api2aiPrimitiveUnion, z.array(__api2aiPrimitiveUnion)]);

export const inputZodByTool = {
    "openMeteoGeocodeSearch": z.object({ "pathParams": z.record(z.string(), __api2aiPrimitiveUnion).describe("No path parameters.").optional(), "query": z.object({ "name": z.string().describe("City/place search text, e.g. Bernstein."), "count": z.number().describe("Number of matches to return.").optional(), "language": z.string().describe("Language code for result names, e.g. de or en.").optional(), "countryCode": z.string().describe("ISO country code filter, e.g. AT.").optional() }).strict().describe("Query parameters from OpenAPI.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper.")
};

export const MCP_HOST_BASE_URL_ENV_KEY = 'API2AI_MCP_BASE_URL_ENV_KEY';
export const MCP_HOST_AUTH_ENV_KEY = 'API2AI_MCP_AUTH_ENV_KEY';

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

/** Host session (base URL, credential, decoded JWT). Re-reads env on every call — dev only, no signature verify. */
export function resolveHostContext() {
    const baseUrlKey = process.env[MCP_HOST_BASE_URL_ENV_KEY]?.trim();
    const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
    if (!baseUrl) {
        throw new Error(
            'Missing host base URL. Pass --base-url-env on mcp-serve.mjs and set the variable (or use smoke-generated).'
        );
    }

    const authKey = process.env[MCP_HOST_AUTH_ENV_KEY]?.trim();
    let credential = authKey ? process.env[authKey]?.trim() : undefined;
    credential = credential || undefined;

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
}

export const queryParamSerializationByTool = {
    "openMeteoGeocodeSearch": {
        "name": {
            "style": "form",
            "explode": true
        },
        "count": {
            "style": "form",
            "explode": true
        },
        "language": {
            "style": "form",
            "explode": true
        },
        "countryCode": {
            "style": "form",
            "explode": true
        }
    }
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


export async function invokeTool(toolName, options = {}, hostContext) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const host = hostContext ?? resolveHostContext();
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
