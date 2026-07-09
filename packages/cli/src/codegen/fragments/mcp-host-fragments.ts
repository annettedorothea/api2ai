import {
    renderMcpHostSharedTemplate,
    type McpHostSharedFragmentSet,
    type McpHostSharedMode
} from '@toolfactory.dev/core/codegen';
import { hostCoreTypesFragment } from './host-core-types.js';
import {
    resolveHostContextForCallFragment,
    resolveHostContextForHttpCallPassthroughFragment,
    resolveHostContextForHttpCallPublicFragment,
    validateHostAtStartupFragment,
    validateHttpMcpHostAtStartupFragment
} from './host-runtime.js';
import { oauthHostContextBaseUrlFieldsFragment, validateOAuthHttpHostAtStartupFragment } from './oauth-host-runtime.js';
import { resolveHostContextForOAuthSessionFragment } from './oauth-session-context.js';
import { readGeneratedModuleTailFragment } from './read-generated-module-tail.js';
import { describeUpstreamEnvFieldFragment, startupBannerConnectionEnvNotePrefixFragment } from './startup-banner.js';

/** api2ai product fragments for {@link renderMcpHostSharedTemplate}. */
const api2aiMcpHostFragments: McpHostSharedFragmentSet = {
    hostCoreTypes: hostCoreTypesFragment(),
    envLoadingToCredentialGap: '\n\n\n',
    readGeneratedModuleTail: readGeneratedModuleTailFragment(),
    validateHostAtStartup: validateHostAtStartupFragment(),
    resolveHostContextForCall: resolveHostContextForCallFragment(),
    validateHttpMcpHostAtStartup: validateHttpMcpHostAtStartupFragment(),
    resolveHostContextForHttpCallPublic: resolveHostContextForHttpCallPublicFragment(),
    resolveHostContextForHttpCallPassthrough: resolveHostContextForHttpCallPassthroughFragment(),
    validateOAuthHttpHostAtStartup: validateOAuthHttpHostAtStartupFragment(),
    oauthHostContextBaseUrlFields: oauthHostContextBaseUrlFieldsFragment(),
    resolveHostContextForOAuthSession: resolveHostContextForOAuthSessionFragment(),
    describeUpstreamEnvField: describeUpstreamEnvFieldFragment(),
    startupBannerConnectionEnvNotePrefix: startupBannerConnectionEnvNotePrefixFragment()
};

export function renderMcpHostSharedSource(mode: McpHostSharedMode): string {
    return renderMcpHostSharedTemplate(mode, api2aiMcpHostFragments);
}
