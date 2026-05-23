import type { McpHostConfig } from './mcp-host-env.js';

export function parseMcpServeArgv(argv: string[]): { modulePath: string; hostConfig: McpHostConfig } {
    const positional: string[] = [];
    let baseUrlEnv: string | undefined;
    let authEnv: string | undefined;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i]!;
        if (arg === '--base-url-env') {
            baseUrlEnv = argv[++i];
            if (!baseUrlEnv) {
                throw new Error('Missing value after --base-url-env');
            }
            continue;
        }
        if (arg === '--auth-env') {
            authEnv = argv[++i];
            if (!authEnv) {
                throw new Error('Missing value after --auth-env');
            }
            continue;
        }
        if (arg.startsWith('-')) {
            throw new Error(`Unknown option: ${arg}`);
        }
        positional.push(arg);
    }

    const modulePath = positional[0];
    if (!modulePath) {
        throw new Error('Usage: node mcp-serve.mjs <path-to-*-tools.mjs> --base-url-env VAR [--auth-env VAR]');
    }
    if (!baseUrlEnv) {
        throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
    }

    return {
        modulePath,
        hostConfig: {
            baseUrlEnv,
            authEnv
        }
    };
}

export function validateHostConfigAtStartup(hostConfig: McpHostConfig, requiresAuth: boolean): void {
    const baseUrl = process.env[hostConfig.baseUrlEnv]?.trim();
    if (!baseUrl) {
        throw new Error(
            `Environment variable "${hostConfig.baseUrlEnv}" is missing or empty (required by --base-url-env).`
        );
    }

    if (!requiresAuth) {
        return;
    }

    if (!hostConfig.authEnv) {
        throw new Error('Generated tools require auth; pass --auth-env <ENV_VAR_NAME> on the MCP host.');
    }

    const credential = process.env[hostConfig.authEnv]?.trim();
    if (!credential) {
        throw new Error(
            `Environment variable "${hostConfig.authEnv}" is missing or empty (required by --auth-env).`
        );
    }
}
