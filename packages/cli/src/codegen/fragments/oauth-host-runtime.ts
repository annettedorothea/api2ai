export function validateOAuthHttpHostAtStartupFragment(): string {
    return `
function validateOAuthHttpHostAtStartup(
    httpHostConfig: OAuthHttpHostRuntimeConfig,
    _generated: GeneratedHostModule
): void {
    
    const baseUrlKey = httpHostConfig.baseUrlEnvKey?.trim();
    if (!baseUrlKey) {
        throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
    }
    const baseUrl = process.env[baseUrlKey]?.trim();
    if (!baseUrl) {
        throw new Error(
            'Environment variable "' + baseUrlKey + '" is missing or empty (required by --base-url-env).'
        );
    }
    
}`.trim();
}

export function oauthHostContextBaseUrlFieldsFragment(): string {
    return `
function oauthHostContextBaseUrlFields(
    httpHostConfig: OAuthHttpHostRuntimeConfig,
    _generated: GeneratedHostModule
): Pick<ApiLikeHostContext, 'baseUrl'> {
    return { baseUrl: resolveOAuthHostBaseUrl(httpHostConfig) };
}`.trim();
}

export function requireBaseUrlEnvArgvCheckFragment(hostConfigExpr: string): string {
    return `if (!${hostConfigExpr}) {
        throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
    }`;
}
