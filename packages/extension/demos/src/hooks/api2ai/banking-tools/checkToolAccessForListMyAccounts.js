import { decodeBankingPortalPayload } from '../../shared/decode-banking-portal-payload.js';
function hasPermission(permissions, required) {
    return Array.isArray(permissions) && permissions.includes(required);
}
/** protected + checkToolAccess — banking:read on portal token. */
export async function checkToolAccessForListMyAccounts(credential) {
    const claims = await decodeBankingPortalPayload(credential);
    if (!hasPermission(claims.permissions, 'banking:read')) {
        throw new Error('Portal token missing banking:read permission.');
    }
}
