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
/** public + prepareToolCall — cap units per request (no credential required). */
export function prepareToolCallForListVacationRentals(options) {
    const limit = resolveLimitQuery(options);
    return {
        ...options,
        query: { ...options.query, limit }
    };
}
