import { decodeJwtPayload } from '../../shared/decode-jwt-payload.js';
/** protected + prepareToolCall — fill optional customerId, scope for role=user. */
export async function prepareToolCallForListBookings(options, credential) {
    const claims = await decodeJwtPayload(credential);
    const jwtCustomer = String(claims.customerId ?? '').trim();
    const role = String(claims.role ?? '').trim();
    let customerId = options.pathParams?.customerId;
    if (customerId == null || String(customerId).trim() === '') {
        customerId = jwtCustomer;
    }
    const normalized = String(customerId).trim();
    if (role === 'user' && normalized !== jwtCustomer) {
        throw new Error(`customerId "${normalized}" does not match session claim "${jwtCustomer}".`);
    }
    return {
        ...options,
        pathParams: { ...options.pathParams, customerId: normalized }
    };
}
