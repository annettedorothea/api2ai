import path from 'node:path';
import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { Api2AiDslAstType, Model, Operation } from './generated/ast.js';
import { isCheckedAccess } from './generated/ast.js';
import type { Api2AiDslServices } from './api-2-ai-dsl-module.js';
import { accessRequiresAuth, getOptionalParams } from './operation-access.js';
import {
    getCookieParameterMessages,
    getDslBodyWithoutOpenApiRequestBodyWarning,
    getUnknownApiParamPatchWarnings,
    getUnknownOptionalParamWarnings,
    getUnsupportedSerializationMessages,
    findOpenApiInvokeParameter,
    loadOpenApi,
    makeOperationLookupKey
} from './openapi.js';
import { parseExampleAgainstSchemaType, parseApiParamSpec } from './api-param-spec.js';

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
        if (!model.auth) {
            for (const operation of model.operations) {
                if (!operation.access) {
                    continue;
                }
                if (accessRequiresAuth(operation)) {
                    accept('error', 'access `protected` and `checked` require an auth block on the model.', {
                        node: operation,
                        property: 'access'
                    });
                }
            }
        }
    }

    private checkOperationRequiredKeys(model: Model, accept: ValidationAcceptor): void {
        for (const operation of model.operations) {
            if (operation.toolName === undefined) {
                accept('error', 'Operation requires `toolName: <id>`.', {
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

            const optionalParams = getOptionalParams(operation);
            for (const warning of getUnknownOptionalParamWarnings(
                optionalParams,
                openApiOperation,
                operation.method,
                operation.path
            )) {
                const body = isCheckedAccess(operation.access) ? operation.access.checkedBody : undefined;
                accept('warning', warning.message, {
                    node: body ?? operation.access,
                    property: 'optionalParams',
                    index: warning.index
                });
            }

            const bodyWarning = getDslBodyWithoutOpenApiRequestBodyWarning(
                operation.body,
                openApiOperation,
                operation.method,
                operation.path
            );
            if (bodyWarning) {
                accept('warning', bodyWarning, {
                    node: operation,
                    property: 'body'
                });
            }

            for (const warning of getUnknownApiParamPatchWarnings(
                operation.params,
                openApiOperation,
                operation.method,
                operation.path
            )) {
                accept('warning', warning.message, {
                    node: operation,
                    property: 'params',
                    index: warning.index
                });
            }

            for (const entry of operation.params?.entries ?? []) {
                const parsed = parseApiParamSpec(entry.spec);
                if (parsed.example === undefined) {
                    continue;
                }
                const openApiParam = findOpenApiInvokeParameter(entry.key, openApiOperation);
                if (!openApiParam) {
                    continue;
                }
                const schemaType = openApiParam.schema?.type;
                const exampleWarning = parseExampleAgainstSchemaType(parsed.example, schemaType);
                if (exampleWarning) {
                    accept('warning', exampleWarning, {
                        node: entry.spec,
                        property: 'fields'
                    });
                }
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
