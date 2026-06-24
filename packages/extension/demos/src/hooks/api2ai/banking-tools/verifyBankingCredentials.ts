import { decodeJwt } from 'jose';
import { loggingAdapter } from '../../../utils/logging-adapter.js';

export type ModuleCredentials = {
    customerId: string;
    role: string;
};

export class BankingCredentials implements ModuleCredentials {
    readonly customerId: string;
    readonly role: string;

    constructor(init: ModuleCredentials) {
        this.customerId = init.customerId;
        this.role = init.role;
    }

    toString(): string {
        return `customerId=${this.customerId} role=${this.role}`;
    }
}

export function toBankingCredentials(data: ModuleCredentials | Record<string, unknown>): BankingCredentials {
    return new BankingCredentials({
        customerId: String(data.customerId ?? ''),
        role: String(data.role ?? '')
    });
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: BankingCredentials;
};

function resolveInboundClaims(token: string): Record<string, unknown> {
    try {
        return decodeJwt(token) as Record<string, unknown>;
    } catch {
        return {};
    }
}

export async function verifyBankingCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
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
    loggingAdapter.debug('banking verifyBankingCredentials', {
        customerId,
        role,
        tokenPrefix: upstreamCredential.slice(0, 12)
    });
    return {
        upstreamCredential,
        credentials: toBankingCredentials({ customerId, role })
    };
}

export { verifyBankingCredentials as verifyCredential, toBankingCredentials as toModuleCredentials };
