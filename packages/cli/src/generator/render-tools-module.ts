import type { Model, Operation } from 'api-2-ai-dsl-language';
import type { LoadedOpenApi } from 'api-2-ai-dsl-language';
import { getAccessKind, getOptionalParams, loadOpenApi, makeOperationLookupKey } from 'api-2-ai-dsl-language';
import {
    buildInputZodBlock,
    resolveMcpServerIdentityFromDestination,
    type ProjectBootstrapConfig
} from '@core2ai/core/codegen';
import { expandToNode, toString } from 'langium/generate';
import * as path from 'node:path';
import {
    buildMcpDescription,
    buildMcpTitle,
    buildQueryParamSerializationLookup,
    buildToolInputSchema,
    type JsonSchemaDict
} from '../openapi-tool-codegen.js';
import { createSharedInvokeBlock } from './invoke-render.js';
import { renderParameterCheckerImports, renderParameterCheckersMap, type ToolAccess } from './render-check-stubs.js';

export type ResolvedToolCodegen = {
    toolName: string;
    title: string;
    description: string;
    method: Model['operations'][number]['method'];
    path: string;
    example?: string;
    access: ToolAccess;
};

export type RenderToolsModuleInput = {
    model: Model;
    source: string;
    destinationTsPath: string;
    stubPaths: Map<string, string>;
    bootstrapConfig: ProjectBootstrapConfig;
};

function serializeJsonForModule(value: unknown): string {
    return JSON.stringify(value, null, 4);
}

function requireToolName(operation: Operation): string {
    if (operation.toolName === undefined || operation.toolName.trim().length === 0) {
        throw new Error(
            `Codegen: operation ${operation.method} ${operation.path} is missing required \`toolName\`. Re-run after validation passes.`
        );
    }
    return operation.toolName.trim();
}

async function loadOpenApiForModel(model: Model, sourcePath: string): Promise<LoadedOpenApi> {
    const absSource = path.resolve(sourcePath);
    const baseDir = path.dirname(absSource);
    return loadOpenApi(model.openapi, baseDir);
}

function resolveToolsFromLoaded(model: Model, loaded: LoadedOpenApi): ResolvedToolCodegen[] {
    return model.operations.map((operation) => {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            throw new Error(
                `Codegen: operation ${operation.method} ${operation.path} not found in OpenAPI (${model.openapi}). Re-run validates the DSL earlier – ensure spec matches.`
            );
        }
        return {
            toolName: requireToolName(operation),
            title: buildMcpTitle(operation, details),
            description: buildMcpDescription(operation, details, model.auth),
            method: operation.method,
            path: operation.path,
            example: operation.example,
            access: getAccessKind(operation)
        };
    });
}

function buildSchemasFromLoaded(model: Model, loaded: LoadedOpenApi): Record<string, JsonSchemaDict> {
    const out: Record<string, JsonSchemaDict> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildToolInputSchema(details, getOptionalParams(operation));
    }
    return out;
}

function buildQuerySerializationFromLoaded(
    model: Model,
    loaded: LoadedOpenApi
): Record<string, Record<string, { style: string; explode: boolean }>> {
    const out: Record<string, Record<string, { style: string; explode: boolean }>> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildQueryParamSerializationLookup(details);
    }
    return out;
}

function mergeParallelToolData(
    toolsMeta: ResolvedToolCodegen[],
    schemas: Record<string, JsonSchemaDict>,
    querySerialization: Record<string, Record<string, { style: string; explode: boolean }>>
): {
    toolsLiteral: string;
    orderedSchemas: Record<string, JsonSchemaDict>;
    querySerializationLiteral: string;
} {
    const toolsLiteral = serializeJsonForModule(toolsMeta);
    const orderedSchemas: Record<string, JsonSchemaDict> = {};
    const orderedQuerySerialization: Record<string, Record<string, { style: string; explode: boolean }>> = {};
    for (const t of toolsMeta) {
        orderedSchemas[t.toolName] =
            schemas[t.toolName] ??
            ({
                type: 'object',
                description: 'Fallback schema.',
                properties: {},
                additionalProperties: true
            } as JsonSchemaDict);
        orderedQuerySerialization[t.toolName] = querySerialization[t.toolName] ?? {};
    }
    return {
        toolsLiteral,
        orderedSchemas,
        querySerializationLiteral: serializeJsonForModule(orderedQuerySerialization)
    };
}

function authRuntimeKind(model: Model): 'none' | 'credential' {
    return model.auth ? 'credential' : 'none';
}

function renderGeneratedImports(parameterCheckerImports: string): string {
    return parameterCheckerImports.length > 0 ? `${parameterCheckerImports}\n\n` : '';
}

function renderMcpServerIdentityExports(name: string, version: string): string {
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

function assembleToolsModuleSource(
    enrichedToolsLiteral: string,
    mcpServerIdentityBlock: string,
    toolRuntimeBlock: string,
    model: Model,
    source: string,
    parameterCheckerImports: string
): string {
    const authConfigLiteral = renderAuthConfig(model);
    const sourceReference = renderSourceReference(source);

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

    const importPrefix = renderGeneratedImports(parameterCheckerImports);

    const fileNode = expandToNode`
/**
 * Generated from: ${sourceReference}
 * Referenced OpenAPI: ${model.openapi}
 */
${importPrefix}
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
    /** MCP tool arguments only (host context is supplied by stdio-mcp-server / http-mcp-server). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
    jwt?: Record<string, unknown>;
};

export type CheckedHostContext = {
    credential: string;
    jwt?: Record<string, unknown>;
};

${authDecl}

${mcpServerIdentityBlock}
${toolRuntimeBlock}
    `.appendNewLineIfNotEmpty();
    return toString(fileNode);
}

/** Renders `generated/tools/*-tools.ts` source text. */
export async function renderToolsModule(input: RenderToolsModuleInput): Promise<string> {
    const { model, source, destinationTsPath, stubPaths, bootstrapConfig } = input;
    const loaded = await loadOpenApiForModel(model, source);
    const toolsMeta = resolveToolsFromLoaded(model, loaded);
    const schemas = buildSchemasFromLoaded(model, loaded);
    const querySerialization = buildQuerySerializationFromLoaded(model, loaded);
    const { toolsLiteral, orderedSchemas, querySerializationLiteral } = mergeParallelToolData(
        toolsMeta,
        schemas,
        querySerialization
    );
    const authKind = authRuntimeKind(model);
    const mcpServerIdentity = resolveMcpServerIdentityFromDestination(destinationTsPath, bootstrapConfig);
    const mcpServerIdentityBlock = renderMcpServerIdentityExports(mcpServerIdentity.name, mcpServerIdentity.version);

    const hasChecked = stubPaths.size > 0;
    const parameterCheckerImports = hasChecked ? renderParameterCheckerImports(destinationTsPath, stubPaths) : '';
    const parameterCheckersMap = hasChecked ? renderParameterCheckersMap(stubPaths) : '';
    const authRuntimePrefix = parameterCheckersMap.length > 0 ? `${parameterCheckersMap}\n\n` : '';

    const toolRuntimeBlock = `${authRuntimePrefix}${buildInputZodBlock(orderedSchemas)}\n${createSharedInvokeBlock(
        querySerializationLiteral,
        authKind,
        hasChecked
    )}`;

    return assembleToolsModuleSource(
        toolsLiteral,
        mcpServerIdentityBlock,
        toolRuntimeBlock,
        model,
        source,
        parameterCheckerImports
    );
}
