import type { ModuleCredentials } from './verifyBookingsCredentials.js';
import type { InvokeOptions } from '../../../../generated/api2ai/tools/bookings-tools.js';

const MAX_LIMIT = 10;

function resolveLimitQuery(options: InvokeOptions): number {
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

/** protected + authorize — admin-only cross-customer listing. */
export function authorizeListAllBookings(credentials: ModuleCredentials): void {
    const role = String(credentials.role ?? '').trim();
    if (role.length === 0) {
        throw new Error('JWT payload missing role claim.');
    }
    if (role !== 'admin') {
        throw new Error(`Admin role required to list all bookings; JWT role is "${role}".`);
    }
}

/** protected + authorize + prepare — admin gate plus limit cap. */
export function prepareListAllBookingsInput(options: InvokeOptions, credentials?: ModuleCredentials): InvokeOptions {
    if (!credentials) {
        throw new Error('Prepare requires credentials.');
    }
    void credentials;
    const limit = resolveLimitQuery(options);
    return {
        ...options,
        query: { ...options.query, limit }
    };
}
