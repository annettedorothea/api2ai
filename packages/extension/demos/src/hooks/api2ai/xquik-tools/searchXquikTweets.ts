import type { InvokeOptions } from '../../../../generated/api2ai/tools/xquik-tools.js';

export const MAX_XQUIK_TWEET_LIMIT = 20;

export function prepareToolCallForSearchXquikTweets(options: InvokeOptions, _credential: string): InvokeOptions {
    const raw = options.query?.limit;
    if (raw == null || String(raw).trim() === '') {
        return { ...options, query: { ...options.query, limit: MAX_XQUIK_TWEET_LIMIT } };
    }
    const limit = Number(raw);
    if (!Number.isFinite(limit) || limit < 1) {
        throw new Error('limit must be a positive integer.');
    }
    if (limit > MAX_XQUIK_TWEET_LIMIT) {
        throw new Error(`limit must not exceed ${MAX_XQUIK_TWEET_LIMIT}.`);
    }
    return { ...options, query: { ...options.query, limit: Math.floor(limit) } };
}
