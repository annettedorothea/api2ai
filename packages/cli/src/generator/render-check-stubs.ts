import type { Model } from 'api-2-ai-dsl-language';
import {
    accessRequiresAuth,
    getAccessKind,
    isCheckToolAccessEnabled,
    isPrepareToolCallEnabled
} from 'api-2-ai-dsl-language';
import {
    checkToolAccessExportName,
    listCheckToolAccessToolNamesFromSpecs,
    listPrepareToolCallHookEntriesFromSpecs,
    listPrepareToolCallToolNamesFromSpecs,
    prepareToolCallExportName,
    renderCheckStubsFromSpecs,
    renderCheckToolAccessHookImports,
    renderCheckToolAccessHooksMap,
    renderPrepareToolCallHookImports,
    renderPrepareToolCallHooksMap,
    resolveAuthPipelineTier,
    type ToolHookStubSpec,
    type AuthPipelineTier,
    type HookStubMaps
} from '@toolfactory.dev/core/codegen';
import { renderInvokeAuthPipeline } from '../codegen/auth-pipeline-render.js';

export type ToolAccess = 'public' | 'protected';

export {
    checkToolAccessExportName,
    prepareToolCallExportName,
    renderCheckToolAccessHookImports,
    renderCheckToolAccessHooksMap,
    renderPrepareToolCallHookImports,
    renderPrepareToolCallHooksMap,
    renderInvokeAuthPipeline,
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
    return listCheckToolAccessToolNamesFromSpecs(listToolHookSpecs(model));
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
    return listPrepareToolCallToolNamesFromSpecs(listToolHookSpecs(model));
}

export function listPrepareToolCallHookEntries(model: Model): { toolName: string; access: 'public' | 'protected' }[] {
    return listPrepareToolCallHookEntriesFromSpecs(listToolHookSpecs(model));
}

export async function renderCheckStubs(
    source: string,
    model: Model,
    toolsModuleTsPath: string
): Promise<Map<string, string>> {
    return renderCheckStubsFromSpecs(source, listToolHookSpecs(model), toolsModuleTsPath);
}

export function modelHasAuthPipeline(model: Model): boolean {
    return model.operations.some((operation) => accessRequiresAuth(operation) || isPrepareToolCallEnabled(operation));
}
