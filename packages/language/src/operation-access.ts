import type { Operation } from './generated/ast.js';
import { isCheckedAccess, isProtectedAccess, isPublicAccess } from './generated/ast.js';

export type AccessKind = 'public' | 'protected' | 'checked';

export function getAccessKind(operation: Operation): AccessKind {
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
    if (isCheckedAccess(access)) {
        return 'checked';
    }
    throw new Error('Operation is missing access.');
}

export function getOptionalParams(operation: Operation): readonly string[] {
    const access = operation.access;
    if (isCheckedAccess(access) && access.checkedBody?.optionalParams) {
        return access.checkedBody.optionalParams;
    }
    return [];
}

export function accessRequiresAuth(operation: Operation): boolean {
    if (!operation.access) {
        return false;
    }
    const kind = getAccessKind(operation);
    return kind === 'protected' || kind === 'checked';
}
