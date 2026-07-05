import { withValidatedListLimit } from './resolveLimitQuery.js';
/** public + prepare — cap reports per request (no credential required). */
export function prepareToolCallForListSpaceflightReports(options) {
    return withValidatedListLimit(options);
}
