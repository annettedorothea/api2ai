import type { Model } from 'api-2-ai-dsl-language';
import { expandToNode, toString } from 'langium/generate';
import * as path from 'node:path';

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
            prefix: model.auth.prefix,
            fromJwt: model.auth.fromJwt
        },
        null,
        4
    );
}

function renderSourceReference(source: string): string {
    return path.basename(source);
}

export function renderTsModule(
    enrichedToolsLiteral: string,
    mcpServerIdentityBlock: string,
    toolRuntimeBlock: string,
    model: Model,
    source: string,
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);
    const insecureTlsExport = usesInsecureTls
        ? '\nexport const insecureTls = true;\n'
        : '\nexport const insecureTls = false;\n';

    const authDecl = `type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
    fromJwt?: string;
};

export const requiresAuth = ${model.auth && model.operations.some((op) => !op.public) ? 'true' : 'false'};
export const authConfig: AuthConfig | undefined = ${authConfigLiteral};`;

    const fileNode = expandToNode`
/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */
${insecureTlsExport}
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
    source: string,
    authKind: 'none' | 'credential',
    usesInsecureTls: boolean
): string {
    const sourceReference = renderSourceReference(source);
    return `/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */

export const insecureTls = ${usesInsecureTls ? 'true' : 'false'};

export const generatedTools = ${enrichedToolsLiteral};

export const requiresAuth = ${model.auth && model.operations.some((op) => !op.public) ? 'true' : 'false'};

export const authConfig = ${renderAuthConfig(model)};

${mcpServerIdentityBlock}
${toolRuntimeBlock}
`;
}
