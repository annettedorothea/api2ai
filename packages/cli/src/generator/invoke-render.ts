function renderInsecureTlsSetup(usesInsecureTls: boolean): string {
    return usesInsecureTls
        ? `
import { Agent, fetch } from 'undici';

const insecureTlsDispatcher = new Agent({ connect: { rejectUnauthorized: false } });
`
        : '';
}

function renderJwtHelpers(usesFromJwt: boolean): string {
    return usesFromJwt
        ? `
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
`
        : '';
}

function renderAuthHelpers(authKind: 'none' | 'credential'): string {
    return authKind === 'credential'
        ? `
function resolveAuthSecret(authConfig, credential) {
    if (!credential || !String(credential).trim()) {
        throw new Error('Missing host credential (MCP host --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}`
        : '';
}

function renderAuthApplicationBlock(authKind: 'none' | 'credential'): string {
    return authKind === 'none'
        ? ''
        : `
    if (authConfig && !tool.public) {
        const authValue = resolveAuthSecret(authConfig, credential);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }`;
}

function renderAuth401Hint(authKind: 'none' | 'credential'): string {
    return authKind === 'credential'
        ? `msg +=
                    ' Check MCP host --auth-env (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';`
        : '';
}

function renderInsecureTlsFetch(usesInsecureTls: boolean): string {
    return usesInsecureTls
        ? `
    if (insecureTls) {
        requestInit.dispatcher = insecureTlsDispatcher;
    }`
        : '';
}

function renderQuerySerializationHelpers(querySerializationLiteralBody: string): string {
    return `export const queryParamSerializationByTool = ${querySerializationLiteralBody};

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
}`;
}

function renderInvokeToolFunction(
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean
): string {
    const resolveCall = renderAuthApplicationBlock(authKind);
    const auth401Block = renderAuth401Hint(authKind);
    const insecureTlsFetch = renderInsecureTlsFetch(usesInsecureTls);

    return `export async function invokeTool(toolName, options = {}, hostContext) {
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
    };${resolveCall}

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };

    if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(options.body);
    }${insecureTlsFetch}

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
                ${auth401Block}
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
}`;
}

export function createSharedInvokeBlock(
    querySerializationLiteralBody: string,
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean,
    usesFromJwt: boolean
): string {
    return `${renderInsecureTlsSetup(usesInsecureTls)}
${renderQuerySerializationHelpers(querySerializationLiteralBody)}
${renderJwtHelpers(usesFromJwt)}${renderAuthHelpers(authKind)}

${renderInvokeToolFunction(authKind, usesInsecureTls)}
`.trim();
}
