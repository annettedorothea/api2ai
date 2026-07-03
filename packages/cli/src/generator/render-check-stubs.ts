import type { Model } from 'api-2-ai-dsl-language';
import { accessRequiresAuth, getAccessKind, isToolAuthorizeEnabled, isToolPrepareEnabled } from 'api-2-ai-dsl-language';
import {
    authorizeExportName,
    ensureToolHookStubsFromSource,
    renderAuthorizerImports,
    renderAuthorizersMap,
    renderPreparerImports,
    renderPreparersMap,
    renderInvokeAuthPipeline as renderInvokeAuthPipelineCore,
    resolveAuthPipelineTier,
    type AuthPipelineTier,
    type HookStubMaps,
    type ToolHookStubSpec,
    prepareInputExportName
} from '@toolfactory.dev/core/codegen';

export type ToolAccess = 'public' | 'protected';

export {
    authorizeExportName,
    prepareInputExportName,
    renderAuthorizerImports,
    renderAuthorizersMap,
    renderPreparerImports,
    renderPreparersMap,
    resolveAuthPipelineTier,
    type AuthPipelineTier,
    type HookStubMaps
};

function listToolHookSpecs(model: Model): ToolHookStubSpec[] {
    const specs: ToolHookStubSpec[] = [];
    for (const operation of model.operations) {
        const toolName = operation.toolName?.trim();
        if (!toolName) {
            continue;
        }
        const authorize = isToolAuthorizeEnabled(operation);
        const prepare = isToolPrepareEnabled(operation);
        if (authorize || prepare) {
            specs.push({ toolName, authorize, prepare, access: getAccessKind(operation) });
        }
    }
    return specs;
}

export function listAuthorizeToolNames(model: Model): string[] {
    return listToolHookSpecs(model)
        .filter((spec) => spec.authorize)
        .map((spec) => spec.toolName);
}

export function listProtectedToolNames(model: Model): string[] {
    return model.operations
        .map((operation) => operation.toolName?.trim())
        .filter((toolName): toolName is string => Boolean(toolName))
        .filter((toolName) => {
            const operation = model.operations.find((op) => op.toolName?.trim() === toolName);
            return operation !== undefined && accessRequiresAuth(operation);
        });
}

export function listPrepareToolNames(model: Model): string[] {
    return listToolHookSpecs(model)
        .filter((spec) => spec.prepare)
        .map((spec) => spec.toolName);
}

/** Writes write-once `src/hooks/{product}/<mcpModule>/<toolName>.ts` stubs; returns stub paths for imports. */
export async function renderCheckStubs(
    source: string,
    model: Model,
    toolsModuleTsPath: string
): Promise<Map<string, string>> {
    const specs = listToolHookSpecs(model);
    if (specs.length === 0) {
        return new Map();
    }
    return ensureToolHookStubsFromSource(source, specs, toolsModuleTsPath);
}

export function modelHasAuthPipeline(model: Model): boolean {
    return model.operations.some((operation) => accessRequiresAuth(operation) || isToolPrepareEnabled(operation));
}

export function renderInvokeAuthPipeline(
    tier: AuthPipelineTier,
    hasVerifyCredential: boolean,
    stubMaps: HookStubMaps
): string {
    return renderInvokeAuthPipelineCore('api2ai', tier, hasVerifyCredential, stubMaps);
}
