import { decodeJwtPayload } from '../../shared/decode-jwt-payload.js';
import type { InvokeOptions } from '../../../../generated/api2ai/tools/bookings-tools.js';

/** protected + prepareToolCall — fill optional customerId, scope for role=user. */
export async function prepareToolCallForListBookings(
    options: InvokeOptions,
    credential: string
): Promise<InvokeOptions> {
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
