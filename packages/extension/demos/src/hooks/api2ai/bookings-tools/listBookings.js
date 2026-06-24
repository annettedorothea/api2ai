/** protected + authorize — role gate (user | admin). */
export function authorizeListBookings(credentials) {
    const jwtCustomer = String(credentials.customerId ?? '').trim();
    if (jwtCustomer.length === 0) {
        throw new Error('credentials missing customerId claim.');
    }
    const role = String(credentials.role ?? '').trim();
    if (role.length === 0) {
        throw new Error('credentials missing role claim.');
    }
    if (role !== 'user' && role !== 'admin') {
        throw new Error(`Unsupported role "${role}".`);
    }
}
/** protected + prepare — fill optional customerId, scope for role=user. */
export function prepareListBookingsInput(options, credentials) {
    if (!credentials) {
        throw new Error('Prepare requires credentials.');
    }
    const jwtCustomer = String(credentials.customerId ?? '').trim();
    const role = String(credentials.role ?? '').trim();
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
