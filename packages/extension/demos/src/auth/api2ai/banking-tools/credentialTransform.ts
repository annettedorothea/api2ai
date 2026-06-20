/**
 * Wired via --credential-transform-module pointing at this file's compiled .js sibling.
 */
import { decodeJwt } from 'jose';
import { loggingAdapter } from '../../../utils/logging-adapter.js';

export type CredentialTransformInput = {
    inboundCredential: string;
    inboundClaims?: Record<string, unknown>;
};

export type CredentialTransformResult = {
    upstreamCredential: string;
    sessionJwtClaims?: Record<string, unknown>;
};

function resolveInboundClaims(input: CredentialTransformInput): Record<string, unknown> {
    if (input.inboundClaims && Object.keys(input.inboundClaims).length > 0) {
        return input.inboundClaims;
    }
    try {
        return decodeJwt(input.inboundCredential) as Record<string, unknown>;
    } catch {
        return {};
    }
}

export async function transformCredential(input: CredentialTransformInput): Promise<CredentialTransformResult> {
    const claims = resolveInboundClaims(input);
    const customerId = String(claims.customerId ?? '').trim();
    const role = String(claims.role ?? '').trim();
    if (customerId.length === 0 || role.length === 0) {
        throw new Error('Banking credential transform: inbound credential missing customerId or role.');
    }
    const upstreamCredential = `demo-api-${customerId}`;
    loggingAdapter.debug('banking credential transform', {
        customerId,
        role,
        tokenPrefix: upstreamCredential.slice(0, 12)
    });
    return {
        upstreamCredential,
        sessionJwtClaims: { customerId, role }
    };
}
