import type { Model } from 'api-2-ai-dsl-language';
import { accessRequiresAuth, isToolAuthorizeEnabled, isToolValidateEnabled } from 'api-2-ai-dsl-language';
import {
    authorizeExportName,
    ensureToolAuthStubsFromSource,
    renderAuthorizerImports,
    renderAuthorizersMap,
    renderValidatorImports,
    renderValidatorsMap,
    renderInvokeAuthPipeline as renderInvokeAuthPipelineCore,
    resolveAuthPipelineTier,
    type AuthPipelineTier,
    type AuthStubMaps,
    type ToolAuthStubSpec,
    validateInputExportName
} from '@core2ai/core/codegen';

export type ToolAccess = 'public' | 'protected';

export {
    authorizeExportName,
    validateInputExportName,
    renderAuthorizerImports,
    renderAuthorizersMap,
    renderValidatorImports,
    renderValidatorsMap,
    resolveAuthPipelineTier,
    type AuthPipelineTier,
    type AuthStubMaps
};

function listToolAuthSpecs(model: Model): ToolAuthStubSpec[] {
    const specs: ToolAuthStubSpec[] = [];
    for (const operation of model.operations) {
        const toolName = operation.toolName?.trim();
        if (!toolName) {
            continue;
        }
        const authorize = isToolAuthorizeEnabled(operation);
        const validate = isToolValidateEnabled(operation);
        if (authorize || validate) {
            specs.push({ toolName, authorize, validate });
        }
    }
    return specs;
}

export function listAuthorizeToolNames(model: Model): string[] {
    return listToolAuthSpecs(model)
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

export function listValidateToolNames(model: Model): string[] {
    return listToolAuthSpecs(model)
        .filter((spec) => spec.validate)
        .map((spec) => spec.toolName);
}

/** Writes write-once `src/auth/{product}/<mcpModule>/<toolName>.ts` stubs; returns stub paths for imports. */
export async function renderCheckStubs(
    source: string,
    model: Model,
    toolsModuleTsPath: string
): Promise<Map<string, string>> {
    const specs = listToolAuthSpecs(model);
    if (specs.length === 0) {
        return new Map();
    }
    return ensureToolAuthStubsFromSource(source, specs, toolsModuleTsPath);
}

export function modelHasAuthPipeline(model: Model): boolean {
    return model.operations.some((operation) => accessRequiresAuth(operation) || isToolValidateEnabled(operation));
}

export function renderInvokeAuthPipeline(
    tier: AuthPipelineTier,
    hasVerifyCredential: boolean,
    stubMaps: AuthStubMaps
): string {
    return renderInvokeAuthPipelineCore('api2ai', tier, hasVerifyCredential, stubMaps);
}
