function renderAuthHelpers(authKind: 'none' | 'credential'): string {
    if (authKind !== 'credential') {
        return '';
    }
    return `
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
}`;
}

function renderAuthApplicationBlock(authKind: 'none' | 'credential'): string {
    if (authKind === 'none') {
        return '';
    }
    return `
    if (authConfig && tool.access !== 'public') {
        const authValue = resolveAuthSecret(authConfig!, credential);
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
                    ' Check MCP host --auth-env on stdio-mcp-server (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';`
        : '';
}

import { renderInvokeCredentialAndParameterCheck } from './render-check-stubs.js';

function renderQuerySerializationHelpers(querySerializationLiteralBody: string): string {
    return `export const queryParamSerializationByTool = ${querySerializationLiteralBody};

function appendSerializedQueryParams(
    searchParams: URLSearchParams,
    toolName: string,
    query: InvokeOptions['query']
): void {
    if (!query) {
        return;
    }
    const hintsByParam: Record<string, { style?: string; explode?: boolean }> = (queryParamSerializationByTool as Record<string, Record<string, { style?: string; explode?: boolean }>>)[toolName] ?? {};
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
}`;
}

function renderHostBinding(): string {
    return `
    if (hostContext === undefined) {
        throw new Error(
            'invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).'
        );
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;`;
}

function renderInvokeToolFunction(authKind: 'none' | 'credential', hasChecked: boolean): string {
    const resolveCall = renderAuthApplicationBlock(authKind);
    const auth401Block = renderAuth401Hint(authKind);
    const auth401Section =
        authKind === 'credential'
            ? `if (authConfig && tool.access !== 'public') {
                ${auth401Block}
            }`
            : `if (tool.access !== 'public') {
                msg += ' The API may require authentication.';
            }`;
    const credentialAndParams = renderInvokeCredentialAndParameterCheck(authKind === 'credential', hasChecked);
    const hostBinding = renderHostBinding();

    return `export async function invokeTool(
    toolName: string,
    options: InvokeOptions = {},
    hostContext?: ApiHostContext
): Promise<unknown> {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }
    loggingAdapter.debug('invokeTool', { toolName, method: tool.method, path: tool.path });
${hostBinding}${credentialAndParams}${resolveCall}

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
            ${auth401Section}
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
}`;
}

export function createSharedInvokeBlock(
    querySerializationLiteralBody: string,
    authKind: 'none' | 'credential',
    hasChecked: boolean
): string {
    return `${renderQuerySerializationHelpers(querySerializationLiteralBody)}
${renderAuthHelpers(authKind)}

${renderInvokeToolFunction(authKind, hasChecked)}
`.trim();
}
