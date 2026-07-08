import type { Auth, Operation } from './generated/ast.js';
import { isPrepareToolCallBody, isPrepareToolCallTrue, isProtectedAccess, isPublicAccess } from './generated/ast.js';

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

export function isVerifyCredentialEnabled(auth: Auth | undefined): boolean {
    return auth?.hooks?.verifyCredential === true || auth?.hooks?.tokenExchange === true;
}

export function isTokenExchangeEnabled(auth: Auth | undefined): boolean {
    return auth?.hooks?.tokenExchange === true;
}

export function isCheckToolAccessEnabled(operation: Operation): boolean {
    return operation.hooks?.checkToolAccess === true;
}

export function isPrepareToolCallEnabled(operation: Operation): boolean {
    const spec = operation.hooks?.prepareToolCall;
    if (!spec) {
        return false;
    }
    return isPrepareToolCallTrue(spec) || isPrepareToolCallBody(spec);
}

export function getClientMayOmit(operation: Operation): readonly string[] {
    const spec = operation.hooks?.prepareToolCall;
    if (isPrepareToolCallBody(spec) && spec.clientMayOmit) {
        return spec.clientMayOmit;
    }
    return [];
}

export function accessRequiresAuth(operation: Operation): boolean {
    if (!operation.access) {
        return false;
    }
    return getAccessKind(operation) === 'protected';
}
