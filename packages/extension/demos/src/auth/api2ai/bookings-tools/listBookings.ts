import type { ModuleCredentials } from './verifyBookingsCredentials.js';
import type { InvokeOptions } from '../../../../generated/api2ai/tools/bookings-tools.js';

export function validateListBookingsInput(options: InvokeOptions, credentials: ModuleCredentials): InvokeOptions {
    const jwtCustomer = String(credentials.customerId ?? '').trim();
    if (jwtCustomer.length === 0) {
        throw new Error('credentials missing customerId claim.');
    }
    const role = String(credentials.role ?? '').trim();
    if (role.length === 0) {
        throw new Error('credentials missing role claim.');
    }

    let customerId = options.pathParams?.customerId;
    if (customerId == null || String(customerId).trim() === '') {
        customerId = jwtCustomer;
    }
    const normalized = String(customerId).trim();
    if (role === 'user' && normalized !== jwtCustomer) {
        throw new Error(`customerId "${normalized}" does not match session claim "${jwtCustomer}".`);
    }
    if (role !== 'user' && role !== 'admin') {
        throw new Error(`Unsupported role "${role}".`);
    }

    return {
        ...options,
        pathParams: { ...options.pathParams, customerId: normalized }
    };
}
