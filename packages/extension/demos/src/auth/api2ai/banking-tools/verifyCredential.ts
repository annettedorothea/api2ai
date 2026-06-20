import { decodeJwt } from 'jose';
import { loggingAdapter } from '../../../utils/logging-adapter.js';

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    sessionClaims?: Record<string, unknown>;
};

function resolveInboundClaims(token: string): Record<string, unknown> {
    try {
        return decodeJwt(token) as Record<string, unknown>;
    } catch {
        return {};
    }
}

export async function verifyCredential(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
    const token = input.inboundCredential.trim();
    if (!token) {
        throw new Error('Missing OAuth Bearer token.');
    }
    const claims = resolveInboundClaims(token);
    const customerId = String(claims.customerId ?? '').trim();
    const role = String(claims.role ?? '').trim();
    if (customerId.length === 0 || role.length === 0) {
        throw new Error('Banking OAuth credential: inbound token missing customerId or role.');
    }
    const upstreamCredential = `demo-api-${customerId}`;
    loggingAdapter.debug('banking verifyCredential', {
        customerId,
        role,
        tokenPrefix: upstreamCredential.slice(0, 12)
    });
    return {
        upstreamCredential,
        sessionClaims: { customerId, role }
    };
}
