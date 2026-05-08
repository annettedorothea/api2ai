import path from 'node:path';
import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { Api2AiDslAstType, Model, Operation } from './generated/ast.js';
import type { Api2AiDslServices } from './api-2-ai-dsl-module.js';
import { loadOpenApi, makeOperationLookupKey } from './openapi.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: Api2AiDslServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.Api2AiDslValidator;
    const checks: ValidationChecks<Api2AiDslAstType> = {
        Model: validator.checkModel
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class Api2AiDslValidator {
    async checkModel(model: Model, accept: ValidationAcceptor): Promise<void> {
        this.checkUniqueToolNames(model, accept);
        await this.checkReferencedOperationsExist(model, accept);
    }

    private checkUniqueToolNames(model: Model, accept: ValidationAcceptor): void {
        const seenToolNames = new Map<string, number>();
        model.operations.forEach((operation, index) => {
            const key = operation.toolName;
            const firstIndex = seenToolNames.get(key);
            if (firstIndex !== undefined) {
                accept('error', `toolName "${key}" must be unique.`, {
                    node: model,
                    property: 'operations',
                    index
                });
                return;
            }
            seenToolNames.set(key, index);
        });
    }

    private async checkReferencedOperationsExist(model: Model, accept: ValidationAcceptor): Promise<void> {
        const documentPath = model.$document?.uri.fsPath;
        if (!documentPath) {
            return;
        }
        const baseDir = path.dirname(documentPath);

        let loaded;
        try {
            loaded = await loadOpenApi(model.openapi, baseDir);
        } catch (error) {
            accept('error', `Cannot load OpenAPI document "${model.openapi}": ${this.getErrorMessage(error)}`, {
                node: model,
                property: 'openapi'
            });
            return;
        }

        model.operations.forEach((operation: Operation, index) => {
            const key = makeOperationLookupKey(operation.method, operation.path);
            if (!loaded.operations.has(key)) {
                accept('error', `Operation ${operation.method} ${operation.path} does not exist in the referenced OpenAPI 3.x spec.`, {
                    node: model,
                    property: 'operations',
                    index
                });
            }
        });
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
