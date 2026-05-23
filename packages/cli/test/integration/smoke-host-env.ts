import { applyMcpHostEnvKeys } from '../../mcp-bundle/mcp-host-env.js';

/** Fixed env var names for smoke-generated (not used by mcp-serve). */
const SMOKE_BASE_URL_ENV = 'API2AI_MCP_BASE_URL';
const SMOKE_CREDENTIAL_ENV = 'API2AI_MCP_CREDENTIAL';

/** Wire host context like mcp-serve, then set resolved base URL and credential. */
export function applySmokeHostEnv(host: { baseUrl: string; credential?: string }): void {
    applyMcpHostEnvKeys({ baseUrlEnv: SMOKE_BASE_URL_ENV, authEnv: SMOKE_CREDENTIAL_ENV }, []);
    process.env[SMOKE_BASE_URL_ENV] = host.baseUrl;
    if (host.credential !== undefined && host.credential !== '') {
        process.env[SMOKE_CREDENTIAL_ENV] = host.credential;
    } else {
        delete process.env[SMOKE_CREDENTIAL_ENV];
    }
}
