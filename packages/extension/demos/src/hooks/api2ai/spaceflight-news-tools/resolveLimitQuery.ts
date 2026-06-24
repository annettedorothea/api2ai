import type { InvokeOptions } from '../../../../generated/api2ai/tools/spaceflight-news-tools.js';

export const MAX_LIST_LIMIT = 10;

export function resolveLimitQuery(options: InvokeOptions): number {
    const raw = options.query?.limit;
    if (raw == null || String(raw).trim() === '') {
        return MAX_LIST_LIMIT;
    }
    const limit = Number(raw);
    if (!Number.isFinite(limit) || limit < 1) {
        throw new Error('limit must be a positive integer.');
    }
    if (limit > MAX_LIST_LIMIT) {
        throw new Error(`limit must not exceed ${MAX_LIST_LIMIT}.`);
    }
    return Math.floor(limit);
}

export function withValidatedListLimit(options: InvokeOptions): InvokeOptions {
    const limit = resolveLimitQuery(options);
    return {
        ...options,
        query: { ...options.query, limit }
    };
}
