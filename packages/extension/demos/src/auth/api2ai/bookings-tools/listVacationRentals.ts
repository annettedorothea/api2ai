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

/** public + validate — cap units per request (no credentials required). */
export function validateListVacationRentalsInput(
    options: InvokeOptions,
    credentials: ModuleCredentials
): InvokeOptions {
    void credentials;
    const limit = resolveLimitQuery(options);
    return {
        ...options,
        query: { ...options.query, limit }
    };
}
