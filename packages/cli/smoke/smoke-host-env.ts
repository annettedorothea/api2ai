import type { McpHostAdapter } from '@core2ai/mcp-host';

/** Fixed env var names for api2ai smoke (direct values via configureFromArgv). */
const SMOKE_BASE_URL_ENV = 'MCP_HOST_BASE_URL';
const SMOKE_CREDENTIAL_ENV = 'MCP_HOST_CREDENTIAL';

/** Smoke uses the generated adapter API: configureFromArgv + set resolved values. */
export function applySmokeHostEnv(
    adapter: McpHostAdapter,
    host: { baseUrl: string; credential?: string },
    envDirs: string[]
): void {
    const argv = ['--base-url-env', SMOKE_BASE_URL_ENV];
    if (host.credential !== undefined && host.credential !== '') {
        argv.push('--auth-env', SMOKE_CREDENTIAL_ENV);
    }
    adapter.configureFromArgv(argv, envDirs);
    process.env[SMOKE_BASE_URL_ENV] = host.baseUrl;
    if (host.credential !== undefined && host.credential !== '') {
        process.env[SMOKE_CREDENTIAL_ENV] = host.credential;
    } else {
        delete process.env[SMOKE_CREDENTIAL_ENV];
    }
}
