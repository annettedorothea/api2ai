import type { Model } from 'api-2-ai-dsl-language';
import { getAccessKind } from 'api-2-ai-dsl-language';
import { expandToNode, toString } from 'langium/generate';
import * as path from 'node:path';

function renderGeneratedImports(mcpHostJwtImport: string, parameterCheckerImports: string): string {
    const lines = [mcpHostJwtImport, parameterCheckerImports].filter((line) => line.length > 0);
    return lines.length > 0 ? `${lines.join('\n')}\n\n` : '';
}

export function renderMcpServerIdentityExports(name: string, version: string): string {
    return `export const mcpServerName = ${JSON.stringify(name)};
export const mcpServerVersion = ${JSON.stringify(version)};
`;
}

function renderAuthConfig(model: Model): string {
    if (!model.auth) {
        return 'undefined';
    }
    return JSON.stringify(
        {
            location: model.auth.location,
            name: model.auth.name,
            prefix: model.auth.prefix
        },
        null,
        4
    );
}

function renderSourceReference(source: string): string {
    return path.basename(source);
}

function requiresAuthLiteral(model: Model): string {
    if (!model.auth) {
        return 'false';
    }
    const needsCredential = model.operations.some((op) => getAccessKind(op) !== 'public');
    return needsCredential ? 'true' : 'false';
}

export function renderTsModule(
    enrichedToolsLiteral: string,
    mcpServerIdentityBlock: string,
    toolRuntimeBlock: string,
    model: Model,
    source: string,
    _authKind: 'none' | 'credential',
    usesInsecureTls: boolean,
    parameterCheckerImports = '',
    mcpHostJwtImport = ''
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);
    const insecureTlsExport = usesInsecureTls
        ? '\nexport const insecureTls = true;\n'
        : '\nexport const insecureTls = false;\n';

    const authDecl = model.auth
        ? `type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
};

export const requiresAuth = ${requiresAuthLiteral(model)};
export const authConfig: AuthConfig | undefined = ${authConfigLiteral};`
        : `export const requiresAuth = false;
export const authConfig: undefined = undefined;`;

    const importPrefix = renderGeneratedImports(mcpHostJwtImport, parameterCheckerImports);

    const fileNode = expandToNode`
/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */
${importPrefix}${insecureTlsExport}
export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
    access: 'public' | 'protected' | 'checked';
};

export const generatedTools: GeneratedTool[] = ${enrichedToolsLiteral};

export type InvokeOptions = {
    /** MCP tool arguments only (not visible to the agent: host context via mcpHostAdapter). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

${authDecl}

${mcpServerIdentityBlock}
${toolRuntimeBlock}
    `.appendNewLineIfNotEmpty();
    return toString(fileNode);
}

export function renderJsModule(
    enrichedToolsLiteral: string,
    mcpServerIdentityBlock: string,
    toolRuntimeBlock: string,
    model: Model,
    _source: string,
    _authKind: 'none' | 'credential',
    usesInsecureTls: boolean,
    parameterCheckerImports = '',
    mcpHostJwtImport = ''
): string {
    const importPrefix = renderGeneratedImports(mcpHostJwtImport, parameterCheckerImports);
    return `/**
 * Generated JS module (types live in the sibling .ts file).
 */
${importPrefix}
export const insecureTls = ${usesInsecureTls ? 'true' : 'false'};

export const generatedTools = ${enrichedToolsLiteral};

export const requiresAuth = ${requiresAuthLiteral(model)};

export const authConfig = ${renderAuthConfig(model)};

${mcpServerIdentityBlock}
${toolRuntimeBlock}
`;
}
