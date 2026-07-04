import { withValidatedListLimit } from './resolveLimitQuery.js';
/** public + prepare — cap articles per request (no credential required). */
export function prepareToolCallForListSpaceflightArticles(options) {
    return withValidatedListLimit(options);
}
