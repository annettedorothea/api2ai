import type { Model } from 'api-2-ai-dsl-language';
import {
    accessRequiresAuth,
    getAccessKind,
    isAfterToolCallEnabled,
    isCheckToolAccessEnabled,
    isPrepareToolCallEnabled
} from 'api-2-ai-dsl-language';
import {
    afterToolCallExportName,
    checkToolAccessExportName,
    listAfterToolCallHookEntriesFromSpecs,
    listAfterToolCallToolNamesFromSpecs,
    listCheckToolAccessToolNamesFromSpecs,
    listPrepareToolCallHookEntriesFromSpecs,
    listPrepareToolCallToolNamesFromSpecs,
    prepareToolCallExportName,
    renderAfterToolCallHookImports,
    renderAfterToolCallHooksMap,
    renderCheckStubsFromSpecs,
    renderCheckToolAccessHookImports,
    renderCheckToolAccessHooksMap,
    renderPrepareToolCallHookImports,
    renderPrepareToolCallHooksMap,
    resolveInvokePipelineTier,
    type ToolHookStubSpec,
    type InvokePipelineTier,
    type HookStubMaps
} from '@toolfactory.dev/core/codegen';
import { renderInvokePipeline } from '../codegen/invoke-pipeline-render.js';

export type ToolAccess = 'public' | 'protected';

export {
    afterToolCallExportName,
    checkToolAccessExportName,
    prepareToolCallExportName,
    renderAfterToolCallHookImports,
    renderAfterToolCallHooksMap,
    renderCheckToolAccessHookImports,
    renderCheckToolAccessHooksMap,
    renderPrepareToolCallHookImports,
    renderPrepareToolCallHooksMap,
    renderInvokePipeline,
    resolveInvokePipelineTier,
    type InvokePipelineTier,
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
        const afterToolCall = isAfterToolCallEnabled(operation);
        if (checkToolAccess || prepareToolCall || afterToolCall) {
            specs.push({
                toolName,
                checkToolAccess,
                prepareToolCall,
                afterToolCall,
                access: getAccessKind(operation)
            });
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

export function listAfterToolCallToolNames(model: Model): string[] {
    return listAfterToolCallToolNamesFromSpecs(listToolHookSpecs(model));
}

export function listPrepareToolCallHookEntries(model: Model): { toolName: string; access: 'public' | 'protected' }[] {
    return listPrepareToolCallHookEntriesFromSpecs(listToolHookSpecs(model));
}

export function listAfterToolCallHookEntries(model: Model): { toolName: string; access: 'public' | 'protected' }[] {
    return listAfterToolCallHookEntriesFromSpecs(listToolHookSpecs(model));
}

export async function renderCheckStubs(
    source: string,
    model: Model,
    toolsModuleTsPath: string
): Promise<Map<string, string>> {
    return renderCheckStubsFromSpecs(source, listToolHookSpecs(model), toolsModuleTsPath);
}

export function modelHasInvokePipeline(model: Model): boolean {
    return model.operations.some(
        (operation) =>
            accessRequiresAuth(operation) || isPrepareToolCallEnabled(operation) || isAfterToolCallEnabled(operation)
    );
}
