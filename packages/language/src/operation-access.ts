import type { Operation } from './generated/ast.js';
import { isAuthorizeTrue, isProtectedAccess, isPublicAccess, isPrepareBody, isPrepareTrue } from './generated/ast.js';

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

export function isToolPrepareEnabled(operation: Operation): boolean {
    const prepare = operation.prepare;
    if (!prepare) {
        return false;
    }
    return isPrepareTrue(prepare) || isPrepareBody(prepare);
}

/** @deprecated Use isToolPrepareEnabled */
export const isToolValidateEnabled = isToolPrepareEnabled;

export function getOptionalParams(operation: Operation): readonly string[] {
    const prepare = operation.prepare;
    if (isPrepareBody(prepare) && prepare.optionalParams) {
        return prepare.optionalParams;
    }
    return [];
}

export function accessRequiresAuth(operation: Operation): boolean {
    if (!operation.access) {
        return false;
    }
    return getAccessKind(operation) === 'protected';
}
