import type { Model, Operation } from 'api-2-ai-dsl-language';
import type { LoadedOpenApi } from 'api-2-ai-dsl-language';
import {
    getAccessKind,
    getClientMayOmit,
    isCheckToolAccessEnabled,
    isPrepareToolCallEnabled,
    isVerifyCredentialEnabled,
    isTokenExchangeEnabled,
    loadOpenApi,
    makeOperationLookupKey
} from 'api-2-ai-dsl-language';
import {
    buildInputZodBlock,
    emitGeneratedZodPreamble,
    ensureVerifyCredentialStubFromSource,
    ensureTokenExchangeStubFromSource,
    renderVerifyCredentialImport,
    renderVerifyCredentialReExport,
    renderTokenExchangeReExport,
    resolveBootstrapProjectRootFromSource,
    resolveMcpServerIdentityFromDestination,
    renderMcpBuildGeneratedAtReExport,
    type ProjectBootstrapConfig
} from '@toolfactory.dev/core/codegen';
import { expandToNode, toString } from 'langium/generate';
import * as path from 'node:path';
import {
    buildMcpDescription,
    buildMcpTitle,
    buildInvokeParamBuckets,
    buildQueryParamSerializationLookup,
    buildQueryParamWireNamesLookup,
    buildPathParamWireNamesLookup,
    buildHeaderParamWireNamesLookup,
    buildToolInputSchema,
    type JsonSchemaDict
} from '../openapi-tool-codegen.js';
import { createSharedInvokeBlock } from './invoke-render.js';
import {
    listCheckToolAccessToolNames,
    listPrepareToolCallHookEntries,
    listPrepareToolCallToolNames,
    modelHasAuthPipeline,
    renderCheckToolAccessHookImports,
    renderCheckToolAccessHooksMap,
    renderPrepareToolCallHookImports,
    renderPrepareToolCallHooksMap,
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
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
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

function resolveToolsFromLoaded(model: Model, loaded: LoadedOpenApi, mcpModuleName: string): ResolvedToolCodegen[] {
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
            description: buildMcpDescription(operation, details, model.auth, mcpModuleName),
            method: operation.method,
            path: operation.path,
            access: getAccessKind(operation),
            hasCheckToolAccess: isCheckToolAccessEnabled(operation),
            hasPrepareToolCall: isPrepareToolCallEnabled(operation)
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
        out[requireToolName(operation)] = buildToolInputSchema(details, getClientMayOmit(operation), operation);
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

function buildQueryParamWireNamesFromLoaded(
    model: Model,
    loaded: LoadedOpenApi
): Record<string, Record<string, string>> {
    const out: Record<string, Record<string, string>> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildQueryParamWireNamesLookup(details);
    }
    return out;
}

function buildPathParamWireNamesFromLoaded(
    model: Model,
    loaded: LoadedOpenApi
): Record<string, Record<string, string>> {
    const out: Record<string, Record<string, string>> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildPathParamWireNamesLookup(details);
    }
    return out;
}

function buildHeaderParamWireNamesFromLoaded(
    model: Model,
    loaded: LoadedOpenApi
): Record<string, Record<string, string>> {
    const out: Record<string, Record<string, string>> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        out[requireToolName(operation)] = buildHeaderParamWireNamesLookup(details);
    }
    return out;
}

function mergeParallelToolData(
    toolsMeta: ResolvedToolCodegen[],
    schemas: Record<string, JsonSchemaDict>,
    querySerialization: Record<string, Record<string, { style: string; explode: boolean }>>,
    queryParamWireNames: Record<string, Record<string, string>>,
    pathParamWireNames: Record<string, Record<string, string>>,
    headerParamWireNames: Record<string, Record<string, string>>,
    invokeParamBuckets: Record<string, ReturnType<typeof buildInvokeParamBuckets>>
): {
    toolsLiteral: string;
    orderedSchemas: Record<string, JsonSchemaDict>;
    querySerializationLiteral: string;
    queryParamWireNamesLiteral: string;
    pathParamWireNamesLiteral: string;
    headerParamWireNamesLiteral: string;
    invokeParamBucketsLiteral: string;
} {
    const toolsLiteral = serializeJsonForModule(toolsMeta);
    const orderedSchemas: Record<string, JsonSchemaDict> = {};
    const orderedQuerySerialization: Record<string, Record<string, { style: string; explode: boolean }>> = {};
    const orderedQueryParamWireNames: Record<string, Record<string, string>> = {};
    const orderedPathParamWireNames: Record<string, Record<string, string>> = {};
    const orderedHeaderParamWireNames: Record<string, Record<string, string>> = {};
    const orderedInvokeParamBuckets: Record<string, ReturnType<typeof buildInvokeParamBuckets>> = {};
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
        orderedQueryParamWireNames[t.toolName] = queryParamWireNames[t.toolName] ?? {};
        orderedPathParamWireNames[t.toolName] = pathParamWireNames[t.toolName] ?? {};
        orderedHeaderParamWireNames[t.toolName] = headerParamWireNames[t.toolName] ?? {};
        orderedInvokeParamBuckets[t.toolName] = invokeParamBuckets[t.toolName] ?? {
            pathParams: [],
            query: [],
            headers: [],
            arrayQuery: []
        };
    }
    return {
        toolsLiteral,
        orderedSchemas,
        querySerializationLiteral: serializeJsonForModule(orderedQuerySerialization),
        queryParamWireNamesLiteral: serializeJsonForModule(orderedQueryParamWireNames),
        pathParamWireNamesLiteral: serializeJsonForModule(orderedPathParamWireNames),
        headerParamWireNamesLiteral: serializeJsonForModule(orderedHeaderParamWireNames),
        invokeParamBucketsLiteral: serializeJsonForModule(orderedInvokeParamBuckets)
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
    void destinationTsPath;
    void projectRoot;
    const loggingImport = `import { loggingAdapter } from '@toolfactory.dev/core/logging';`;
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

function renderMcpServerIdentityBlock(destinationTsPath: string, name: string, version: string): string {
    return `${renderMcpServerIdentityExports(name, version)}
${renderMcpBuildGeneratedAtReExport(destinationTsPath)}
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
    tokenExchangeStubPath: string | undefined,
    hasVerifyCredential: boolean,
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
    const tokenExchangeExportBlock =
        tokenExchangeStubPath !== undefined
            ? `\n${renderTokenExchangeReExport(destinationTsPath, tokenExchangeStubPath)}\n`
            : '';

    const importPrefix = renderGeneratedImports(
        destinationTsPath,
        projectRoot,
        authStubImports,
        verifyStubPath !== undefined ? renderVerifyCredentialImport(destinationTsPath, verifyStubPath) : '',
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
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
};

export const generatedTools: GeneratedTool[] = ${enrichedToolsLiteral};

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by the MCP host in servers/*). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
};

${authDecl}
${verifyExportBlock}${tokenExchangeExportBlock}
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
    const toolsMeta = resolveToolsFromLoaded(model, loaded, mcpModuleName);
    const schemas = buildSchemasFromLoaded(model, loaded);
    const querySerialization = buildQuerySerializationFromLoaded(model, loaded);
    const queryParamWireNames = buildQueryParamWireNamesFromLoaded(model, loaded);
    const pathParamWireNames = buildPathParamWireNamesFromLoaded(model, loaded);
    const headerParamWireNames = buildHeaderParamWireNamesFromLoaded(model, loaded);
    const invokeParamBuckets = buildInvokeParamBucketsFromLoaded(model, loaded);
    const {
        toolsLiteral,
        orderedSchemas,
        querySerializationLiteral,
        queryParamWireNamesLiteral,
        pathParamWireNamesLiteral,
        headerParamWireNamesLiteral,
        invokeParamBucketsLiteral
    } = mergeParallelToolData(
        toolsMeta,
        schemas,
        querySerialization,
        queryParamWireNames,
        pathParamWireNames,
        headerParamWireNames,
        invokeParamBuckets
    );
    const authKind = authRuntimeKind(model);
    const mcpServerIdentity = resolveMcpServerIdentityFromDestination(destinationTsPath, bootstrapConfig);
    const mcpServerIdentityBlock = renderMcpServerIdentityBlock(
        destinationTsPath,
        mcpServerIdentity.name,
        mcpServerIdentity.version
    );

    const hasAuthPipeline = modelHasAuthPipeline(model);
    const checkToolAccessToolNames = listCheckToolAccessToolNames(model);
    const prepareToolCallToolNames = listPrepareToolCallToolNames(model);
    const authPipelineTier = resolveAuthPipelineTier(
        hasAuthPipeline,
        checkToolAccessToolNames,
        prepareToolCallToolNames
    );
    const hasVerifyCredential = isVerifyCredentialEnabled(model.auth);
    const hasTokenExchange = isTokenExchangeEnabled(model.auth);
    const checkToolAccessImports =
        checkToolAccessToolNames.length > 0
            ? renderCheckToolAccessHookImports(destinationTsPath, stubPaths, checkToolAccessToolNames)
            : '';
    const prepareToolCallImports =
        prepareToolCallToolNames.length > 0
            ? renderPrepareToolCallHookImports(destinationTsPath, stubPaths, prepareToolCallToolNames)
            : '';
    const authStubImports = [checkToolAccessImports, prepareToolCallImports].filter((s) => s.length > 0).join('\n');
    const authMapBlocks: string[] = [];
    if (authPipelineTier === 'full') {
        if (checkToolAccessToolNames.length > 0) {
            authMapBlocks.push(renderCheckToolAccessHooksMap(checkToolAccessToolNames));
        }
        if (prepareToolCallToolNames.length > 0) {
            authMapBlocks.push(renderPrepareToolCallHooksMap(listPrepareToolCallHookEntries(model)));
        }
    }
    const authRuntimePrefixBlock = authMapBlocks.length > 0 ? `${authMapBlocks.join('\n\n')}\n\n` : '';

    const stubMaps = {
        checkToolAccess: checkToolAccessToolNames.length > 0,
        prepareToolCall: prepareToolCallToolNames.length > 0
    };
    const toolRuntimeBlock = `${authRuntimePrefixBlock}${buildInputZodBlock(orderedSchemas)}\n${createSharedInvokeBlock(
        querySerializationLiteral,
        queryParamWireNamesLiteral,
        pathParamWireNamesLiteral,
        headerParamWireNamesLiteral,
        invokeParamBucketsLiteral,
        authKind,
        authPipelineTier,
        stubMaps,
        hasVerifyCredential
    )}`;

    const verifyStubPath = hasVerifyCredential
        ? await ensureVerifyCredentialStubFromSource(source, destinationTsPath)
        : undefined;
    const tokenExchangeStubPath = hasTokenExchange
        ? await ensureTokenExchangeStubFromSource(source, destinationTsPath)
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
        tokenExchangeStubPath,
        hasVerifyCredential,
        hasZodSchemas
    );
}
