import type { Model, Operation } from 'api-2-ai-dsl-language';
import type { LoadedOpenApi } from 'api-2-ai-dsl-language';
import { loadOpenApi, makeOperationLookupKey } from 'api-2-ai-dsl-language';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { buildInputZodBlock } from '@core2ai/codegen';
import { renderMcpHostAdapterBlock } from './generator/host-adapter-render.js';
import { createSharedInvokeBlock } from './generator/invoke-render.js';
import { renderJsModule, renderMcpServerIdentityExports, renderTsModule } from './generator/module-render.js';
import {
    copyBundledMcpServeInto,
    ensureParentDir,
    resolveBootstrapProjectRootFromSource,
    resolveGeneratedCliDir,
    resolveMcpServerIdentityFromDestination,
    writeMinimalPackageJsonIfAbsent
} from './generator/project-bootstrap.js';
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

export type ResolvedToolCodegen = {
    toolName: string;
    title: string;
    description: string;
    method: Model['operations'][number]['method'];
    path: string;
    example?: string;
    public: boolean;
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
            public: operation.public === true
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
        const jwtBound = model.auth?.fromJwt?.trim();
        const omitJwtPath =
            operation.public === true ? undefined : jwtBound && jwtBound.length > 0 ? jwtBound : undefined;
        const base = buildToolInputSchema(details, omitJwtPath);
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
    const usesFromJwt = Boolean(model.auth?.fromJwt?.trim());
    const mcpServerIdentity = resolveMcpServerIdentityFromDestination(tsPath, __generatorDirname);
    const mcpServerIdentityBlock = renderMcpServerIdentityExports(mcpServerIdentity.name, mcpServerIdentity.version);
    const mcpHostAdapterBlock = renderMcpHostAdapterBlock(authKind);
    const toolRuntimeBlock = `${buildInputZodBlock(orderedSchemas)}\n${mcpHostAdapterBlock}\n${createSharedInvokeBlock(
        querySerializationLiteral,
        authKind,
        usesInsecureTls,
        usesFromJwt
    )}`;

    fs.writeFileSync(
        tsPath,
        renderTsModule(toolsLiteral, mcpServerIdentityBlock, toolRuntimeBlock, model, source, authKind, usesInsecureTls)
    );
    fs.writeFileSync(
        jsPath,
        renderJsModule(toolsLiteral, mcpServerIdentityBlock, toolRuntimeBlock, model, source, authKind, usesInsecureTls)
    );

    const cliDir = resolveGeneratedCliDir(tsPath);
    const mcpServePath = copyBundledMcpServeInto(cliDir, __generatorDirname);
    writeMinimalPackageJsonIfAbsent(resolveBootstrapProjectRootFromSource(source), __generatorDirname);

    return { tsPath, jsPath, mcpServePath };
}
