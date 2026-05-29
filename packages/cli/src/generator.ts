import type { Model, Operation } from 'api-2-ai-dsl-language';
import type { LoadedOpenApi } from 'api-2-ai-dsl-language';
import { getAccessKind, getOptionalParams, loadOpenApi, makeOperationLookupKey } from 'api-2-ai-dsl-language';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import {
    buildInputZodBlock,
    copyBundledMcpServeInto,
    ensureParentDir,
    formatGeneratedFilesWithPrettier,
    resolveBootstrapProjectRootFromSource,
    resolveGeneratedCliDir,
    resolveMcpServerIdentityFromDestination,
    writeMinimalPackageJsonIfAbsent,
    type ProjectBootstrapConfig
} from '@core2ai/core/codegen';
import {
    ensureCheckedAuthStubs,
    listCheckedToolNames,
    renderParameterCheckerImports,
    renderParameterCheckersMap,
    type ToolAccess
} from './generator/auth-stub-render.js';
import { MCP_HOST_JWT_IMPORT, renderMcpHostAdapterBlock } from './generator/host-adapter-render.js';
import { createSharedInvokeBlock } from './generator/invoke-render.js';
import { renderJsModule, renderMcpServerIdentityExports, renderTsModule } from './generator/module-render.js';
import {
    buildMcpDescription,
    buildMcpTitle,
    buildQueryParamSerializationLookup,
    buildToolInputSchema,
    type JsonSchemaDict
} from './openapi-tool-codegen.js';

export type GeneratedOutputFiles = {
    tsPath: string;
    jsPath: string;
    mcpServePath: string;
};

declare const __dirname: string | undefined;

function bundleSafeGeneratorImplementationDir(): string {
    // VS Code extension embed bundle (CJS): esbuild sets __dirname next to cli.cjs + resources/.
    if (typeof __dirname !== 'undefined' && __dirname.length > 0) {
        return __dirname;
    }
    // CLI via `node packages/cli/...` (ESM source).
    return path.dirname(url.fileURLToPath(import.meta.url));
}

const __generatorDirname = bundleSafeGeneratorImplementationDir();

function createBootstrapConfig(): ProjectBootstrapConfig {
    return {
        generatorImplementationDir: __generatorDirname,
        embedHomeEnv: 'API2AI_EMBED_HOME',
        fallbackProjectName: 'api2ai-project',
        requiredRuntimeDeps: ['@modelcontextprotocol/sdk', 'zod', '@core2ai/core'],
        dependencyVersionFallbacks: {
            '@modelcontextprotocol/sdk': '^1.29.0',
            zod: '^4.4.3',
            '@core2ai/core': 'github:annettedorothea/core2ai#v0.0.3'
        },
        resolvePackageRoot(dir) {
            const oneUp = path.resolve(dir, '..');
            if (fs.existsSync(path.join(oneUp, 'package.json'))) {
                return oneUp;
            }
            return path.resolve(dir, '..', '..');
        },
        bundledMcpMissingMessage(src) {
            return `Bundled MCP host missing (${src}). Run npm run bundle:mcp-runtime from the workspace root.`;
        },
        missingDepsMessage(pjsonPath, missing) {
            return `[generate] "${pjsonPath}": install MCP runtime dependencies: ${missing.join(', ')} (npm install), then generated/cli/mcp-serve.mjs can run.`;
        }
    };
}

export type ResolvedToolCodegen = {
    toolName: string;
    title: string;
    description: string;
    method: Model['operations'][number]['method'];
    path: string;
    example?: string;
    access: ToolAccess;
};

function serializeJsonForModule(value: unknown): string {
    return JSON.stringify(value, null, 4);
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
            description: buildMcpDescription(operation, details, model.auth, model.insecureEnv),
            method: operation.method,
            path: operation.path,
            example: operation.example,
            access: getAccessKind(operation)
        };
    });
}

/** Validator-enforced invariant: a model that validates has `toolName` set. Returns trimmed text for stable keys and MCP titles. */
function requireToolName(operation: Operation): string {
    if (operation.toolName === undefined || operation.toolName.trim().length === 0) {
        throw new Error(
            `Codegen: operation ${operation.method} ${operation.path} is missing required \`toolName\`. Re-run after validation passes.`
        );
    }
    return operation.toolName.trim();
}

function buildSchemasFromLoaded(model: Model, loaded: LoadedOpenApi): Record<string, JsonSchemaDict> {
    const out: Record<string, JsonSchemaDict> = {};
    for (const operation of model.operations) {
        const key = makeOperationLookupKey(operation.method, operation.path);
        const details = loaded.operations.get(key);
        if (!details) {
            continue;
        }
        const base = buildToolInputSchema(details, getOptionalParams(operation));
        out[requireToolName(operation)] = base;
    }
    return out;
}

function authRuntimeKind(model: Model): 'none' | 'credential' {
    return model.auth ? 'credential' : 'none';
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

async function loadOpenApiForModel(model: Model, sourcePath: string): Promise<LoadedOpenApi> {
    const absSource = path.resolve(sourcePath);
    const baseDir = path.dirname(absSource);
    return loadOpenApi(model.openapi, baseDir);
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

export async function generateOutput(model: Model, source: string, destination: string): Promise<GeneratedOutputFiles> {
    ensureParentDir(destination);
    const bootstrapConfig = createBootstrapConfig();
    const parsed = path.parse(destination);
    const tsPath = parsed.ext === '.ts' ? destination : path.join(parsed.dir, `${parsed.name}.ts`);
    const jsPath = path.join(parsed.dir, `${parsed.name}.mjs`);

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
    const usesInsecureTls = model.insecureEnv === true;
    const mcpServerIdentity = resolveMcpServerIdentityFromDestination(tsPath, bootstrapConfig);
    const mcpServerIdentityBlock = renderMcpServerIdentityExports(mcpServerIdentity.name, mcpServerIdentity.version);
    const mcpHostAdapterBlock = renderMcpHostAdapterBlock(authKind);

    const hasCheckedOps = listCheckedToolNames(model).length > 0;
    const stubPaths = hasCheckedOps ? await ensureCheckedAuthStubs(source, model) : new Map<string, string>();
    const hasChecked = stubPaths.size > 0;
    const parameterCheckerImports = hasChecked ? renderParameterCheckerImports(tsPath, stubPaths) : '';
    const parameterCheckersMap = hasChecked ? renderParameterCheckersMap(stubPaths) : '';
    const mcpHostJwtImport = MCP_HOST_JWT_IMPORT;

    const authRuntimePrefix = parameterCheckersMap.length > 0 ? `${parameterCheckersMap}\n\n` : '';

    const toolRuntimeBlock = `${authRuntimePrefix}${buildInputZodBlock(orderedSchemas)}\n${mcpHostAdapterBlock}\n${createSharedInvokeBlock(
        querySerializationLiteral,
        authKind,
        usesInsecureTls,
        hasChecked
    )}`;

    fs.writeFileSync(
        tsPath,
        renderTsModule(
            toolsLiteral,
            mcpServerIdentityBlock,
            toolRuntimeBlock,
            model,
            source,
            authKind,
            usesInsecureTls,
            parameterCheckerImports,
            mcpHostJwtImport
        )
    );
    fs.writeFileSync(
        jsPath,
        renderJsModule(
            toolsLiteral,
            mcpServerIdentityBlock,
            toolRuntimeBlock,
            model,
            source,
            authKind,
            usesInsecureTls,
            parameterCheckerImports,
            mcpHostJwtImport
        )
    );
    await formatGeneratedFilesWithPrettier([tsPath, jsPath]);

    const cliDir = resolveGeneratedCliDir(tsPath);
    const mcpServePath = copyBundledMcpServeInto(cliDir, bootstrapConfig);
    writeMinimalPackageJsonIfAbsent(resolveBootstrapProjectRootFromSource(source), bootstrapConfig);

    return { tsPath, jsPath, mcpServePath };
}
