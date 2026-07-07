import { decodeJwtPayload } from '../../shared/decode-jwt-payload.js';

/** protected + checkToolAccess — admin-only cross-customer listing. */
export async function checkToolAccessForListAllBookings(credential: string): Promise<void> {
    const claims = await decodeJwtPayload(credential);
    const role = String(claims.role ?? '').trim();
    if (role.length === 0) {
        throw new Error('JWT payload missing role claim.');
    }
    if (role !== 'admin') {
        throw new Error(`Admin role required to list all bookings; JWT role is "${role}".`);
    }
}
