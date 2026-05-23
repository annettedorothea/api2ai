export type McpHostConfig = {
    baseUrlEnv: string;
    authEnv?: string;
};

export const MCP_HOST_BASE_URL_ENV_KEY = 'API2AI_MCP_BASE_URL_ENV_KEY';
export const MCP_HOST_AUTH_ENV_KEY = 'API2AI_MCP_AUTH_ENV_KEY';
export const MCP_HOST_ENV_DIRS = 'API2AI_MCP_ENV_DIRS';

export type McpHostAuthContext = {
    baseUrl: string;
    credential?: string;
    /** JWT payload (decode only, no signature check — dev/testing). */
    jwt?: Record<string, unknown>;
};

export function applyMcpHostEnvKeys(hostConfig: McpHostConfig, envDirs: string[]): void {
    process.env[MCP_HOST_BASE_URL_ENV_KEY] = hostConfig.baseUrlEnv;
    if (hostConfig.authEnv) {
        process.env[MCP_HOST_AUTH_ENV_KEY] = hostConfig.authEnv;
    } else {
        delete process.env[MCP_HOST_AUTH_ENV_KEY];
    }
    if (envDirs.length > 0) {
        process.env[MCP_HOST_ENV_DIRS] = JSON.stringify(envDirs);
    } else {
        delete process.env[MCP_HOST_ENV_DIRS];
    }
}
