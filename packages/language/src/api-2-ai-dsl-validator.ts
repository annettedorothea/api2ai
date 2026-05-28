import path from 'node:path';
import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { Api2AiDslAstType, Model, Operation } from './generated/ast.js';
import type { Api2AiDslServices } from './api-2-ai-dsl-module.js';
import {
    getCookieParameterMessages,
    getUnsupportedSerializationMessages,
    loadOpenApi,
    makeOperationLookupKey
} from './openapi.js';

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
        this.checkAuth(model, accept);
        this.checkOperationAccess(model, accept);
        this.checkOperationRequiredKeys(model, accept);
        this.checkUniqueToolNames(model, accept);
        await this.checkReferencedOperationsExist(model, accept);
    }

    private checkAuth(model: Model, accept: ValidationAcceptor): void {
        const auth = model.auth;
        if (!auth) {
            return;
        }

        if (auth.location === undefined) {
            accept('error', 'auth requires `in: header` or `in: query`.', {
                node: auth,
                property: 'location'
            });
        }
        if (auth.name === undefined) {
            accept('error', 'auth requires `name: "..."`.', {
                node: auth,
                property: 'name'
            });
        } else if (auth.name.trim().length === 0) {
            accept('error', 'auth name must not be empty.', {
                node: auth,
                property: 'name'
            });
        }
    }

    private checkOperationAccess(model: Model, accept: ValidationAcceptor): void {
        const hasRestricted = model.operations.some((op) => op.restricted === true);
        if (hasRestricted && !model.auth) {
            for (const operation of model.operations) {
                if (operation.restricted === true) {
                    accept('error', 'restricted requires an auth block on the model.', {
                        node: operation,
                        property: 'restricted'
                    });
                }
            }
        }
        for (const operation of model.operations) {
            if (operation.public === true && operation.restricted === true) {
                accept('error', 'Operation cannot be both public and restricted.', {
                    node: operation,
                    property: 'public'
                });
            }
            if ((operation.autofillParams?.length ?? 0) > 0 && operation.restricted !== true) {
                accept('error', 'autofillParams requires `restricted` on the operation.', {
                    node: operation,
                    property: 'autofillParams'
                });
            }
        }
    }

    private checkOperationRequiredKeys(model: Model, accept: ValidationAcceptor): void {
        for (const operation of model.operations) {
            if (operation.toolName === undefined) {
                accept('error', 'Operation requires `toolName: "..."`.', {
                    node: operation,
                    property: 'toolName'
                });
            } else if (operation.toolName.trim().length === 0) {
                accept('error', 'Operation `toolName` must not be empty.', {
                    node: operation,
                    property: 'toolName'
                });
            }
            if (operation.intent === undefined) {
                accept('error', 'Operation requires `intent: "..."`.', {
                    node: operation,
                    property: 'intent'
                });
            } else if (operation.intent.trim().length === 0) {
                accept('error', 'Operation `intent` must not be empty.', {
                    node: operation,
                    property: 'intent'
                });
            }
        }
    }

    private checkUniqueToolNames(model: Model, accept: ValidationAcceptor): void {
        const seenToolNames = new Map<string, number>();
        model.operations.forEach((operation, index) => {
            const key = operation.toolName;
            if (key === undefined || key === null || String(key).trim().length === 0) {
                return;
            }
            const normalized = key.trim();
            const firstIndex = seenToolNames.get(normalized);
            if (firstIndex !== undefined) {
                accept('error', `toolName "${normalized}" must be unique.`, {
                    node: model,
                    property: 'operations',
                    index
                });
                return;
            }
            seenToolNames.set(normalized, index);
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
            const opPath = operation.path;
            if (typeof opPath !== 'string' || opPath.trim().length === 0) {
                return;
            }
            const key = makeOperationLookupKey(operation.method, opPath);
            const openApiOperation = loaded.operations.get(key);
            if (!openApiOperation) {
                accept(
                    'error',
                    `Operation ${operation.method} ${opPath} does not exist in the referenced OpenAPI 3.x spec.`,
                    {
                        node: model,
                        property: 'operations',
                        index
                    }
                );
                return;
            }

            for (const message of getUnsupportedSerializationMessages(openApiOperation)) {
                accept('error', `Operation ${operation.method} ${operation.path}: ${message}`, {
                    node: model,
                    property: 'operations',
                    index
                });
            }
            for (const message of getCookieParameterMessages(openApiOperation)) {
                accept('error', `Operation ${operation.method} ${operation.path}: ${message}`, {
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
