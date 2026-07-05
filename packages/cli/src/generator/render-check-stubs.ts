import type { Model } from 'api-2-ai-dsl-language';
import {
    accessRequiresAuth,
    getAccessKind,
    isCheckToolAccessEnabled,
    isPrepareToolCallEnabled
} from 'api-2-ai-dsl-language';
import {
    checkToolAccessExportName,
    ensureToolHookStubsFromSource,
    renderCheckToolAccessHookImports,
    renderCheckToolAccessHooksMap,
    renderPrepareToolCallHookImports,
    renderPrepareToolCallHooksMap,
    renderInvokeAuthPipeline as renderInvokeAuthPipelineCore,
    resolveAuthPipelineTier,
    type AuthPipelineTier,
    type HookStubMaps,
    type ToolHookStubSpec,
    prepareToolCallExportName
} from '@toolfactory.dev/core/codegen';

export type ToolAccess = 'public' | 'protected';

export {
    checkToolAccessExportName,
    prepareToolCallExportName,
    renderCheckToolAccessHookImports,
    renderCheckToolAccessHooksMap,
    renderPrepareToolCallHookImports,
    renderPrepareToolCallHooksMap,
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
        const checkToolAccess = isCheckToolAccessEnabled(operation);
        const prepareToolCall = isPrepareToolCallEnabled(operation);
        if (checkToolAccess || prepareToolCall) {
            specs.push({ toolName, checkToolAccess, prepareToolCall, access: getAccessKind(operation) });
        }
    }
    return specs;
}

export function listCheckToolAccessToolNames(model: Model): string[] {
    return listToolHookSpecs(model)
        .filter((spec) => spec.checkToolAccess)
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

export function listPrepareToolCallToolNames(model: Model): string[] {
    return listToolHookSpecs(model)
        .filter((spec) => spec.prepareToolCall)
        .map((spec) => spec.toolName);
}

export function listPrepareToolCallHookEntries(model: Model): { toolName: string; access: 'public' | 'protected' }[] {
    return listToolHookSpecs(model)
        .filter((spec) => spec.prepareToolCall)
        .map(({ toolName, access }) => ({ toolName, access }));
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
    return model.operations.some((operation) => accessRequiresAuth(operation) || isPrepareToolCallEnabled(operation));
}

export function renderInvokeAuthPipeline(
    tier: AuthPipelineTier,
    hasVerifyCredential: boolean,
    stubMaps: HookStubMaps,
    includeAuthCredential = true
): string {
    return renderInvokeAuthPipelineCore('api2ai', tier, hasVerifyCredential, stubMaps, includeAuthCredential);
}
