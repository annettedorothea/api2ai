import type { InvokeOptions } from '../../../../generated/api2ai/tools/spaceflight-news-tools.js';
import { withValidatedListLimit } from './resolveLimitQuery.js';

/** public + prepare — cap articles per request (no credential required). */
export function prepareToolCallForListSpaceflightArticles(options: InvokeOptions): InvokeOptions {
    return withValidatedListLimit(options);
}
