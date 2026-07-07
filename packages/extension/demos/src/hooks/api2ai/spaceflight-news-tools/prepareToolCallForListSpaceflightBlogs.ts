import type { InvokeOptions } from '../../../../generated/api2ai/tools/spaceflight-news-tools.js';
import { withValidatedListLimit } from './resolveLimitQuery.js';

/** public + prepare — cap blog posts per request (no credential required). */
export function prepareToolCallForListSpaceflightBlogs(options: InvokeOptions): InvokeOptions {
    return withValidatedListLimit(options);
}
