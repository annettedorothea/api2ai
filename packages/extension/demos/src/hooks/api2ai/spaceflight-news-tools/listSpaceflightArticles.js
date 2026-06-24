import { withValidatedListLimit } from './resolveLimitQuery.js';
/** public + prepare — cap articles per request (no credentials required). */
export function prepareListSpaceflightArticlesInput(options) {
    return withValidatedListLimit(options);
}
