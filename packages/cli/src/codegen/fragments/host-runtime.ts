export function validateHostAtStartupFragment(): string {
    return `
function validateHostAtStartup(hostConfig: HostRuntimeConfig, generated: GeneratedHostModule): void {
    
    const baseUrlKey = hostConfig.baseUrlEnvKey?.trim();
    if (!baseUrlKey) {
        throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
    }
    const baseUrl = process.env[baseUrlKey]?.trim();
    if (!baseUrl) {
        throw new Error(
            'Environment variable "' + baseUrlKey + '" is missing or empty (required by --base-url-env).'
        );
    }
    
    if (generated.requiresAuth && !hostConfig.authEnvKey?.trim()) {
        throw new Error('Generated tools require auth; pass --auth-env <ENV_VAR_NAME> on the MCP host.');
    }
}`.trim();
}

export function resolveHostContextForCallFragment(): string {
    return `
async function resolveHostContextForCall(
    hostConfig: HostRuntimeConfig,
    _generated: GeneratedHostModule
): Promise<ApiLikeHostContext> {
    const credential = readCredentialFromEnv(hostConfig.authEnvKey);
    const { credential: c } = normalizeHostCredential(credential);
    
    const baseUrlKey = hostConfig.baseUrlEnvKey?.trim();
    const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
    if (!baseUrl) {
        throw new Error('Missing host base URL. Pass --base-url-env on the MCP host and set the variable.');
    }
    return { baseUrl, credential: c };
}`.trim();
}

export function validateHttpMcpHostAtStartupFragment(): string {
    return `
function validateHttpMcpHostAtStartup(
    httpHostConfig: HttpMcpHostRuntimeConfig,
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

export function resolveHostContextForHttpCallPublicFragment(): string {
    return `
async function resolveHostContextForHttpCall(
    httpHostConfig: HttpMcpHostRuntimeConfig,
    _generated: GeneratedHostModule,
    _incomingHeaders: Record<string, string | string[] | undefined>
): Promise<ApiLikeHostContext> {
    const credential = undefined;
    const { credential: c } = normalizeHostCredential(credential);
    
    const baseUrlKey = httpHostConfig.baseUrlEnvKey?.trim();
    const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
    if (!baseUrl) {
        throw new Error(
            'Missing host base URL. Pass --base-url-env on HTTP MCP host and set the variable.'
        );
    }
    return { baseUrl, credential: c };
}`.trim();
}

export function resolveHostContextForHttpCallPassthroughFragment(): string {
    return `
async function resolveHostContextForHttpCall(
    httpHostConfig: HttpMcpHostRuntimeConfig,
    _generated: GeneratedHostModule,
    incomingHeaders: Record<string, string | string[] | undefined>
): Promise<ApiLikeHostContext> {
    const headerName = readAuthHeaderNameFromEnv();
    let credential = readCredentialFromHttpHeaders(incomingHeaders, headerName);
    if (!credential?.trim()) {
        credential = readCredentialFromEnv(httpHostConfig.authEnvKey);
    }
    const { credential: c } = normalizeHostCredential(credential);
    
    const baseUrlKey = httpHostConfig.baseUrlEnvKey?.trim();
    const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
    if (!baseUrl) {
        throw new Error(
            'Missing host base URL. Pass --base-url-env on HTTP MCP host and set the variable.'
        );
    }
    return { baseUrl, credential: c };
}`.trim();
}
