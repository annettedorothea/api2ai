import type { InvokeOptions } from '../../../../generated/api2ai/tools/spaceflight-news-tools.js';
import { withValidatedListLimit } from './resolveLimitQuery.js';

/** public + prepare — cap reports per request (no credentials required). */
export function prepareListSpaceflightReportsInput(options: InvokeOptions): InvokeOptions {
    return withValidatedListLimit(options);
}
