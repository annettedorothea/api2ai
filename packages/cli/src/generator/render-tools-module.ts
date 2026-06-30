import type { Model, Operation } from 'api-2-ai-dsl-language';
import type { LoadedOpenApi } from 'api-2-ai-dsl-language';
import {
    getAccessKind,
    getOptionalParams,
    isToolAuthorizeEnabled,
    isToolPrepareEnabled,
    loadOpenApi,
    makeOperationLookupKey
} from 'api-2-ai-dsl-language';
import {
    buildInputZodBlock,
    emitGeneratedZodPreamble,
    ensureVerifyCredentialStubFromSource,
    relativeImportToLoggingAdapter,
    renderVerifyCredentialImport,
    renderVerifyCredentialReExport,
    resolveBootstrapProjectRootFromSource,
    resolveMcpServerIdentityFromDestination,
    type ProjectBootstrapConfig
} from '@core2ai/core/codegen';
import { expandToNode, toString } from 'langium/generate';
import * as path from 'node:path';
import {
    buildMcpDescription,
    buildMcpTitle,
    buildInvokeParamBuckets,
    buildInvokeBodySchema,
    buildQueryParamSerializationLookup,
    buildToolInputSchema,
    type JsonSchemaDict
} from '../openapi-tool-codegen.js';
import { createSharedInvokeBlock } from './invoke-render.js';
import {
    listAuthorizeToolNames,
    listProtectedToolNames,
    listPrepareToolNames,
    modelHasAuthPipeline,
    renderAuthorizerImports,
    renderAuthorizersMap,
    renderPreparerImports,
    renderPreparersMap,
    resolveAuthPipelineTier,
    type ToolAccess
} from './render-check-stubs.js';

export type ResolvedToolCodegen = {
    toolName: string;
    title: string;
    description: string;
    method: Model['operations'][number]['method'];
    path: string;
    access: ToolAccess;
    hasAuthorize: boolean;
    hasPrepare: boolean;
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

function resolveToolsFromLoaded(
    model: Model,
    loaded: LoadedOpenApi,
    mcpModuleName: string,
    hostProduct: NonNullable<ProjectBootstrapConfig['hostProduct']>
): ResolvedToolCodegen[] {
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
            description: buildMcpDescription(operation, details, model.auth, mcpModuleName, hostProduct),
            method: operation.method,
            path: operation.path,
            access: getAccessKind(operation),
            hasAuthorize: isToolAuthorizeEnabled(operation),
            hasPrepare: isToolPrepareEnabled(operation)
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
        out[requireToolName(operation)] = buildToolInputSchema(details, getOptionalParams(operation), operation);
    }
    return out;
}

function buildInvokeParamBucketsFromLoaded(
    model: Model,
    loaded: LoadedOpenApi
): Record<string, ReturnType<typeof buildInvokeParamBuckets>> {
    const out: Record<string, ReturnType<typeof buildInvokeParamBuckets>> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildInvokeParamBuckets(details);
    }
    return out;
}

function buildInvokeBodySchemasFromLoaded(
    model: Model,
    loaded: LoadedOpenApi
): Record<string, JsonSchemaDict | undefined> {
    const out: Record<string, JsonSchemaDict | undefined> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildInvokeBodySchema(details);
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
    querySerialization: Record<string, Record<string, { style: string; explode: boolean }>>,
    invokeParamBuckets: Record<string, ReturnType<typeof buildInvokeParamBuckets>>,
    invokeBodySchemas: Record<string, JsonSchemaDict | undefined>
): {
    toolsLiteral: string;
    orderedSchemas: Record<string, JsonSchemaDict>;
    querySerializationLiteral: string;
    invokeParamBucketsLiteral: string;
    invokeBodySchemaByToolLiteral: string;
} {
    const toolsLiteral = serializeJsonForModule(toolsMeta);
    const orderedSchemas: Record<string, JsonSchemaDict> = {};
    const orderedQuerySerialization: Record<string, Record<string, { style: string; explode: boolean }>> = {};
    const orderedInvokeParamBuckets: Record<string, ReturnType<typeof buildInvokeParamBuckets>> = {};
    const orderedInvokeBodySchemas: Record<string, JsonSchemaDict | undefined> = {};
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
        orderedInvokeParamBuckets[t.toolName] = invokeParamBuckets[t.toolName] ?? {
            pathParams: [],
            query: [],
            headers: [],
            arrayQuery: []
        };
        orderedInvokeBodySchemas[t.toolName] = invokeBodySchemas[t.toolName];
    }
    return {
        toolsLiteral,
        orderedSchemas,
        querySerializationLiteral: serializeJsonForModule(orderedQuerySerialization),
        invokeParamBucketsLiteral: serializeJsonForModule(orderedInvokeParamBuckets),
        invokeBodySchemaByToolLiteral: serializeJsonForModule(orderedInvokeBodySchemas)
    };
}

function authRuntimeKind(model: Model): 'none' | 'credential' {
    return model.auth ? 'credential' : 'none';
}

function renderGeneratedImports(
    destinationTsPath: string,
    projectRoot: string,
    authStubImports: string,
    verifyCredentialImport: string,
    hasZodSchemas: boolean
): string {
    const loggingSpec = relativeImportToLoggingAdapter(destinationTsPath, projectRoot);
    const loggingImport = `import { loggingAdapter } from '${loggingSpec}';`;
    const parts = [loggingImport];
    if (hasZodSchemas) {
        parts.push(emitGeneratedZodPreamble().trimEnd());
    }
    if (verifyCredentialImport.length > 0) {
        parts.push(verifyCredentialImport);
    }
    if (authStubImports.length > 0) {
        parts.push(authStubImports);
    }
    return `${parts.join('\n')}\n\n`;
}

function modelRequiresAuth(model: Model): boolean {
    return model.operations.some((op) => getAccessKind(op) === 'protected');
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
    return modelRequiresAuth(model) && model.auth ? 'true' : 'false';
}

function assembleToolsModuleSource(
    enrichedToolsLiteral: string,
    mcpServerIdentityBlock: string,
    toolRuntimeBlock: string,
    model: Model,
    source: string,
    destinationTsPath: string,
    projectRoot: string,
    authStubImports: string,
    verifyStubPath: string | undefined,
    needsModuleCredentials: boolean,
    includeModuleCredentialsInImport: boolean,
    hasZodSchemas: boolean
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
        : `export const requiresAuth = false;`;

    const verifyExportBlock =
        verifyStubPath !== undefined ? `\n${renderVerifyCredentialReExport(destinationTsPath, verifyStubPath)}\n` : '';

    const importPrefix = renderGeneratedImports(
        destinationTsPath,
        projectRoot,
        authStubImports,
        verifyStubPath !== undefined
            ? renderVerifyCredentialImport(destinationTsPath, verifyStubPath, {
                  includeModuleCredentials: includeModuleCredentialsInImport
              })
            : '',
        hasZodSchemas
    );

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
    access: 'public' | 'protected';
    hasAuthorize: boolean;
    hasPrepare: boolean;
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
    upstreamCredential?: string;
    credentials?: unknown;
};

${authDecl}
${verifyExportBlock}
${mcpServerIdentityBlock}
${toolRuntimeBlock}
    `.appendNewLineIfNotEmpty();
    return toString(fileNode);
}

/** Renders `generated/{product}/tools/*-tools.ts` source text. */
export async function renderToolsModule(input: RenderToolsModuleInput): Promise<string> {
    const { model, source, destinationTsPath, stubPaths, bootstrapConfig } = input;
    const loaded = await loadOpenApiForModel(model, source);
    const mcpModuleName = path.parse(destinationTsPath).name;
    if (!bootstrapConfig.hostProduct) {
        throw new Error('Codegen: bootstrapConfig.hostProduct is required (api2ai or db2ai).');
    }
    const hostProduct = bootstrapConfig.hostProduct;
    const toolsMeta = resolveToolsFromLoaded(model, loaded, mcpModuleName, hostProduct);
    const schemas = buildSchemasFromLoaded(model, loaded);
    const querySerialization = buildQuerySerializationFromLoaded(model, loaded);
    const invokeParamBuckets = buildInvokeParamBucketsFromLoaded(model, loaded);
    const invokeBodySchemas = buildInvokeBodySchemasFromLoaded(model, loaded);
    const {
        toolsLiteral,
        orderedSchemas,
        querySerializationLiteral,
        invokeParamBucketsLiteral,
        invokeBodySchemaByToolLiteral
    } = mergeParallelToolData(toolsMeta, schemas, querySerialization, invokeParamBuckets, invokeBodySchemas);
    const authKind = authRuntimeKind(model);
    const mcpServerIdentity = resolveMcpServerIdentityFromDestination(destinationTsPath, bootstrapConfig);
    const mcpServerIdentityBlock = renderMcpServerIdentityExports(mcpServerIdentity.name, mcpServerIdentity.version);

    const hasAuthPipeline = modelHasAuthPipeline(model);
    const authorizeToolNames = listAuthorizeToolNames(model);
    const prepareToolNames = listPrepareToolNames(model);
    const authPipelineTier = resolveAuthPipelineTier(hasAuthPipeline, authorizeToolNames, prepareToolNames);
    const hasProtectedTools = listProtectedToolNames(model).length > 0;
    const needsModuleCredentials = Boolean(model.auth) && hasProtectedTools;
    const includeModuleCredentialsInImport =
        needsModuleCredentials && (authorizeToolNames.length > 0 || prepareToolNames.length > 0);
    const authorizerImports =
        authorizeToolNames.length > 0 ? renderAuthorizerImports(destinationTsPath, stubPaths, authorizeToolNames) : '';
    const preparerImports = prepareToolNames.length > 0 ? renderPreparerImports(destinationTsPath, stubPaths) : '';
    const authStubImports = [authorizerImports, preparerImports].filter((s) => s.length > 0).join('\n');
    const authMapBlocks: string[] = [];
    if (authPipelineTier === 'full') {
        if (authorizeToolNames.length > 0) {
            authMapBlocks.push(renderAuthorizersMap(authorizeToolNames));
        }
        if (prepareToolNames.length > 0) {
            authMapBlocks.push(renderPreparersMap(prepareToolNames, { includeCredentials: needsModuleCredentials }));
        }
    }
    const authRuntimePrefixBlock = authMapBlocks.length > 0 ? `${authMapBlocks.join('\n\n')}\n\n` : '';

    const stubMaps = {
        authorizers: authorizeToolNames.length > 0,
        preparers: prepareToolNames.length > 0
    };
    const toolRuntimeBlock = `${authRuntimePrefixBlock}${buildInputZodBlock(orderedSchemas)}\n${createSharedInvokeBlock(
        querySerializationLiteral,
        invokeParamBucketsLiteral,
        invokeBodySchemaByToolLiteral,
        authKind,
        authPipelineTier,
        stubMaps
    )}`;

    const verifyStubPath =
        model.auth && hasProtectedTools
            ? await ensureVerifyCredentialStubFromSource(source, destinationTsPath)
            : undefined;
    const projectRoot = resolveBootstrapProjectRootFromSource(source);
    const hasZodSchemas = Object.keys(orderedSchemas).length > 0;

    return assembleToolsModuleSource(
        toolsLiteral,
        mcpServerIdentityBlock,
        toolRuntimeBlock,
        model,
        source,
        destinationTsPath,
        projectRoot,
        authStubImports,
        verifyStubPath,
        needsModuleCredentials,
        includeModuleCredentialsInImport,
        hasZodSchemas
    );
}
