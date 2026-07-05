import { withValidatedListLimit } from './resolveLimitQuery.js';
/** public + prepare — cap blog posts per request (no credential required). */
export function prepareToolCallForListSpaceflightBlogs(options) {
    return withValidatedListLimit(options);
}
