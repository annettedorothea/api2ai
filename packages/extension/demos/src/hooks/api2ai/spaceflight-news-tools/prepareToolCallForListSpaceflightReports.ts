import type { InvokeOptions } from '../../../../generated/api2ai/tools/spaceflight-news-tools.js';
import { withValidatedListLimit } from './resolveLimitQuery.js';

/** public + prepare — cap reports per request (no credential required). */
export function prepareToolCallForListSpaceflightReports(options: InvokeOptions): InvokeOptions {
    return withValidatedListLimit(options);
}
