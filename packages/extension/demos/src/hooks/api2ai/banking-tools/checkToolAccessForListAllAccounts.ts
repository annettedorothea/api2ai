import { decodeBankingPortalPayload } from '../../shared/decode-banking-portal-payload.js';

/** protected + checkToolAccess — admin-only cross-customer listing. */
export async function checkToolAccessForListAllAccounts(credential: string): Promise<void> {
    const claims = await decodeBankingPortalPayload(credential);
    const role = String(claims.role ?? '').trim();
    if (role !== 'admin') {
        throw new Error(`Admin role required to list all accounts; portal role is "${role || '(missing)'}".`);
    }
}
