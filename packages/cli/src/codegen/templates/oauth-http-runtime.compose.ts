import { renderOAuthHttpRuntimeTemplate } from '@toolfactory.dev/core/codegen';
import { renderMcpHostSharedSource } from '../fragments/mcp-host-fragments.js';
import { requireBaseUrlEnvArgvCheckFragment } from '../fragments/oauth-host-runtime.js';

/** Generated `cli/oauth-http-runtime.ts` for api2ai projects. */
export function renderOAuthHttpRuntimeCompose(loggingImport: string): string {
    return renderOAuthHttpRuntimeTemplate({
        loggingImport,
        sharedHost: renderMcpHostSharedSource('oauth-http'),
        requireBaseUrlEnvArgvCheck: requireBaseUrlEnvArgvCheckFragment('httpHostConfig.baseUrlEnvKey')
    });
}
