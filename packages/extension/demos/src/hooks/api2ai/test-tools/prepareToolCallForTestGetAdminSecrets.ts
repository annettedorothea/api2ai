import type { InvokeOptions } from '../../../../generated/api2ai/tools/test-tools.js';

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

export function prepareToolCallForTestGetAdminSecrets(options: InvokeOptions, credential: string): InvokeOptions {
    void credential;
    const limit = resolveLimitQuery(options);
    return {
        ...options,
        query: { ...options.query, limit }
    };
}
