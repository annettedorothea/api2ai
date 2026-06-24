import { decodeJwt } from 'jose';
import { loggingAdapter } from '../../../utils/logging-adapter.js';
export class BankingCredentials {
    constructor(init) {
        this.customerId = init.customerId;
        this.role = init.role;
    }
    toString() {
        return `customerId=${this.customerId} role=${this.role}`;
    }
}
export function toBankingCredentials(data) {
    return new BankingCredentials({
        customerId: String(data.customerId ?? ''),
        role: String(data.role ?? '')
    });
}
function resolveInboundClaims(token) {
    try {
        return decodeJwt(token);
    }
    catch {
        return {};
    }
}
export async function verifyBankingCredentials(input) {
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
