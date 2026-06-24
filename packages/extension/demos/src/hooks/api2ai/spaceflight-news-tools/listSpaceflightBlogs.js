import { withValidatedListLimit } from './resolveLimitQuery.js';
/** public + prepare — cap blog posts per request (no credentials required). */
export function prepareListSpaceflightBlogsInput(options) {
    return withValidatedListLimit(options);
}
