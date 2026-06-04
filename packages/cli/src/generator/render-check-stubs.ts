import type { Model } from 'api-2-ai-dsl-language';
import { getAccessKind } from 'api-2-ai-dsl-language';
import {
    ensureCheckedAuthStubsFromSource,
    parameterCheckExportName,
    renderParameterCheckerImports,
    renderParameterCheckersMap
} from '@core2ai/core/codegen';

export type ToolAccess = 'public' | 'protected' | 'checked';

export { parameterCheckExportName, renderParameterCheckerImports, renderParameterCheckersMap };

function listCheckedToolNames(model: Model): string[] {
    const names: string[] = [];
    for (const operation of model.operations) {
        if (getAccessKind(operation) === 'checked' && operation.toolName?.trim()) {
            names.push(operation.toolName.trim());
        }
    }
    return names;
}

/** Writes write-once `src/auth/<toolName>.ts` stubs; returns stub paths for imports. */
export async function renderCheckStubs(
    source: string,
    model: Model,
    toolsModuleTsPath: string
): Promise<Map<string, string>> {
    const checkedToolNames = listCheckedToolNames(model);
    if (checkedToolNames.length === 0) {
        return new Map();
    }
    return ensureCheckedAuthStubsFromSource(source, checkedToolNames, toolsModuleTsPath);
}

export function renderInvokeCredentialAndParameterCheck(hasAuth: boolean, hasChecked: boolean): string {
    const credentialGuard = hasAuth
        ? `
    if (tool.access !== 'public') {
        if (!credential || !String(credential).trim()) {
            throw new Error(
                'Missing host credential. Set the variable named by --auth-env on stdio-mcp-server (re-read on every tool call).'
            );
        }
    }`
        : '';

    const checkedAccessBlock = hasChecked
        ? `
    if (tool.access === 'checked') {
        const check = parameterCheckers[toolName];
        if (typeof check !== 'function') {
            throw new Error('No parameter checker for checked tool: ' + toolName);
        }
        optionsResolved = await Promise.resolve(
            check(options, {
                credential: String(credential).trim(),
                jwt: host.jwt
            })
        );
    }`
        : '';

    const optionsResolvedDecl = hasChecked ? 'let optionsResolved = options' : 'const optionsResolved = options';

    return `${credentialGuard}
    ${optionsResolvedDecl};${checkedAccessBlock}
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
    };`;
}
