import { decodeJwtPayload } from '../../shared/decode-jwt-payload.js';
const MAX_LIMIT = 10;
function resolveLimitQuery(options) {
    const raw = options.query?.limit;
    if (raw == null || String(raw).trim() === '') {
        return MAX_LIMIT;
    }
    const limit = Number(raw);
    if (!Number.isFinite(limit) || limit < 1) {
        throw new Error('limit must be a positive integer.');
    }
    if (limit > MAX_LIMIT) {
        throw new Error(`limit must not exceed ${MAX_LIMIT}.`);
    }
    return Math.floor(limit);
}
/** protected + checkToolAccess — admin-only cross-customer listing. */
export async function checkToolAccessForListAllBookings(credential) {
    const claims = await decodeJwtPayload(credential);
    const role = String(claims.role ?? '').trim();
    if (role.length === 0) {
        throw new Error('JWT payload missing role claim.');
    }
    if (role !== 'admin') {
        throw new Error(`Admin role required to list all bookings; JWT role is "${role}".`);
    }
}
/** protected + prepareToolCall — admin gate plus limit cap. */
export async function prepareToolCallForListAllBookings(options, credential) {
    await checkToolAccessForListAllBookings(credential);
    const limit = resolveLimitQuery(options);
    return {
        ...options,
        query: { ...options.query, limit }
    };
}
