function renderInsecureTlsSetup(usesInsecureTls: boolean): string {
    return usesInsecureTls
        ? `
import { Agent, fetch } from 'undici';

const insecureTlsDispatcher = new Agent({ connect: { rejectUnauthorized: false } });
`
        : '';
}

function renderAuthHelpers(authKind: 'none' | 'credential', typescript: boolean): string {
    if (authKind !== 'credential') {
        return '';
    }
    if (typescript) {
        return `
function resolveAuthSecret(
    authConfig: { location: 'header' | 'query'; name: string; prefix?: string },
    credential: string | undefined
): string {
    if (!credential || !String(credential).trim()) {
        throw new Error('Missing host credential (MCP host --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}`;
    }
    return `
function resolveAuthSecret(authConfig, credential) {
    if (!credential || !String(credential).trim()) {
        throw new Error('Missing host credential (MCP host --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}`;
}

function renderAuthApplicationBlock(authKind: 'none' | 'credential', typescript: boolean): string {
    if (authKind === 'none') {
        return '';
    }
    const authConfigGuard = typescript ? 'authConfig!' : 'authConfig';
    return `
    if (authConfig && tool.access !== 'public') {
        const authValue = resolveAuthSecret(${authConfigGuard}, credential);
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

import { renderInvokeCredentialAndParameterCheck } from './auth-stub-render.js';

function renderQuerySerializationHelpers(querySerializationLiteralBody: string, typescript: boolean): string {
    const appendSignature = typescript
        ? `function appendSerializedQueryParams(
    searchParams: URLSearchParams,
    toolName: string,
    query: InvokeOptions['query']
): void`
        : 'function appendSerializedQueryParams(searchParams, toolName, query)';
    const hintsLine = typescript
        ? '    const hintsByParam: Record<string, { style?: string; explode?: boolean }> = (queryParamSerializationByTool as Record<string, Record<string, { style?: string; explode?: boolean }>>)[toolName] ?? {};'
        : '    const hintsByParam = queryParamSerializationByTool[toolName] ?? {};';
    return `export const queryParamSerializationByTool = ${querySerializationLiteralBody};

${appendSignature} {
    if (!query) {
        return;
    }
${hintsLine}
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

function renderHostBinding(typescript: boolean, authKind: 'none' | 'credential'): string {
    const credentialBinding = authKind === 'credential' ? ', credential' : '';
    if (typescript) {
        return `
    const host: ApiHostContext =
        hostContext !== undefined
            ? (hostContext as ApiHostContext)
            : mcpHostAdapter.resolveHostContext();
    const { baseUrl${credentialBinding} } = host;`;
    }
    return `
    const host = hostContext ?? mcpHostAdapter.resolveHostContext();
    const { baseUrl${credentialBinding} } = host;`;
}

function renderInvokeToolFunction(
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean,
    hasChecked: boolean,
    typescript: boolean
): string {
    const hasAuth = authKind === 'credential';
    const resolveCall = renderAuthApplicationBlock(authKind, typescript);
    const auth401Block = renderAuth401Hint(authKind);
    const auth401Section =
        authKind === 'credential'
            ? `if (authConfig && tool.access !== 'public') {
                ${auth401Block}
            }`
            : `if (tool.access !== 'public') {
                msg += ' The API may require authentication.';
            }`;
    const insecureTlsFetch = renderInsecureTlsFetch(usesInsecureTls);
    const credentialAndParams = renderInvokeCredentialAndParameterCheck(hasAuth, hasChecked, typescript);
    const hostBinding = renderHostBinding(typescript, authKind);
    const signature = typescript
        ? `export async function invokeTool(
    toolName: string,
    options: InvokeOptions = {},
    hostContext?: ApiHostContext
): Promise<unknown>`
        : 'export async function invokeTool(toolName, options = {}, hostContext)';
    const requestInitDecl = typescript
        ? `    const requestInit: Record<string, unknown> = {
        method: tool.method,
        headers: requestHeaders
    };`
        : `    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };`;
    const fetchCall = typescript
        ? '    const response = await fetch(url, requestInit as RequestInit);'
        : '    const response = await fetch(url, requestInit);';

    return `${signature} {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }
${hostBinding}${credentialAndParams}${resolveCall}

${requestInitDecl}

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }${insecureTlsFetch}

${fetchCall}
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
    hasChecked: boolean,
    typescript: boolean
): string {
    return `${renderInsecureTlsSetup(usesInsecureTls)}
${renderQuerySerializationHelpers(querySerializationLiteralBody, typescript)}
${renderAuthHelpers(authKind, typescript)}

${renderInvokeToolFunction(authKind, usesInsecureTls, hasChecked, typescript)}
`.trim();
}
