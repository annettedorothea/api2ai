import type { Operation } from './generated/ast.js';
import { isAuthorizeTrue, isProtectedAccess, isPublicAccess, isValidateBody, isValidateTrue } from './generated/ast.js';

export function getAccessKind(operation: Operation): 'public' | 'protected' {
    const access = operation.access;
    if (!access) {
        throw new Error('Operation is missing access.');
    }
    if (isPublicAccess(access)) {
        return 'public';
    }
    if (isProtectedAccess(access)) {
        return 'protected';
    }
    throw new Error('Operation is missing access.');
}

export function isToolAuthorizeEnabled(operation: Operation): boolean {
    const authorize = operation.authorize;
    if (!authorize) {
        return false;
    }
    return isAuthorizeTrue(authorize);
}

export function isToolValidateEnabled(operation: Operation): boolean {
    const validate = operation.validate;
    if (!validate) {
        return false;
    }
    return isValidateTrue(validate) || isValidateBody(validate);
}

export function getOptionalParams(operation: Operation): readonly string[] {
    const validate = operation.validate;
    if (isValidateBody(validate) && validate.optionalParams) {
        return validate.optionalParams;
    }
    return [];
}

export function accessRequiresAuth(operation: Operation): boolean {
    if (!operation.access) {
        return false;
    }
    return getAccessKind(operation) === 'protected';
}
