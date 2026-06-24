import { withValidatedListLimit } from './resolveLimitQuery.js';
/** public + prepare — cap reports per request (no credentials required). */
export function prepareListSpaceflightReportsInput(options) {
    return withValidatedListLimit(options);
}
