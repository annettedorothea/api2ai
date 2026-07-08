import { decodeBankingPortalPayload } from '../../shared/decode-banking-portal-payload.js';

/** protected — portal JWT after token exchange (token_use: portal). */
export async function verifyBankingCredential(credential: string): Promise<void> {
    const claims = await decodeBankingPortalPayload(credential);
    const tokenUse = String(claims.token_use ?? '').trim();
    if (tokenUse !== 'portal') {
        throw new Error('Expected portal token after token exchange.');
    }
    const customerId = String(claims.customerId ?? '').trim();
    if (customerId.length === 0) {
        throw new Error('Portal token missing customerId claim.');
    }
}

export { verifyBankingCredential as verifyCredential };
