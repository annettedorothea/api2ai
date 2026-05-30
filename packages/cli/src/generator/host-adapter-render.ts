function renderInlineJwtHelpers(): string {
    return `
function decodeJwtPayloadUnsafe(token: string): Record<string, unknown> {
    const parts = String(token).trim().split('.');
    if (parts.length !== 3) {
        throw new Error('credential is not a JWT (expected three dot-separated segments).');
    }
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8')) as Record<string, unknown>;
}

function resolveCredentialFromEnv(authEnvKey: string | undefined): string | undefined {
    const key = authEnvKey?.trim();
    if (!key) {
        return undefined;
    }
    const value = process.env[key]?.trim();
    return value && value.length > 0 ? value : undefined;
}

function resolveCredentialAndOptionalJwt(authEnvKey: string | undefined): {
    credential?: string;
    jwt?: Record<string, unknown>;
} {
    const credential = resolveCredentialFromEnv(authEnvKey);
    if (!credential) {
        return {};
    }
    const segments = String(credential).trim().split('.');
    if (segments.length !== 3) {
        return { credential };
    }
    try {
        return { credential, jwt: decodeJwtPayloadUnsafe(credential) };
    } catch {
        return { credential };
    }
}
`;
}

function renderCredentialResolve(authKind: 'none' | 'credential'): string {
    if (authKind === 'credential') {
        return `
        const { credential, jwt } = resolveCredentialAndOptionalJwt(authKey);
        return { baseUrl, credential, jwt };`;
    }
    return `
        return { baseUrl, credential: undefined, jwt: undefined };`;
}

export function renderMcpHostAdapterBlock(authKind: 'none' | 'credential'): string {
    const credentialResolve = renderCredentialResolve(authKind);
    const jwtHelpers = authKind === 'credential' ? renderInlineJwtHelpers() : '';
    const resolveHostContextTail =
        authKind === 'credential'
            ? `
        const authKey = process.env[META_AUTH_ENV_KEY]?.trim();${credentialResolve}`
            : credentialResolve;

    return `${jwtHelpers}const META_BASE_URL_ENV_KEY = 'MCP_HOST_BASE_URL_ENV_KEY';
const META_AUTH_ENV_KEY = 'MCP_HOST_AUTH_ENV_KEY';
const META_ENV_DIRS = 'MCP_HOST_ENV_DIRS';

function applyHostEnvKeys(
    hostConfig: { baseUrlEnv: string; authEnv?: string },
    envDirs: string[]
): void {
    process.env[META_BASE_URL_ENV_KEY] = hostConfig.baseUrlEnv;
    if (hostConfig.authEnv) {
        process.env[META_AUTH_ENV_KEY] = hostConfig.authEnv;
    } else {
        delete process.env[META_AUTH_ENV_KEY];
    }
    if (envDirs.length > 0) {
        process.env[META_ENV_DIRS] = JSON.stringify(envDirs);
    } else {
        delete process.env[META_ENV_DIRS];
    }
}

export const mcpHostAdapter = {
    configureFromArgv(argv: string[], envDirs: string[]): void {
        let baseUrlEnv: string | undefined;
        let authEnv: string | undefined;
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
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
                throw new Error('Unknown option: ' + arg);
            }
            throw new Error('Unexpected positional argument: ' + arg);
        }
        if (!baseUrlEnv) {
            throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
        }
        applyHostEnvKeys({ baseUrlEnv, authEnv }, envDirs);
    },

    validateAtStartup(requiresAuth: boolean): void {
        const baseUrlEnvName = process.env[META_BASE_URL_ENV_KEY]?.trim();
        if (!baseUrlEnvName) {
            throw new Error('Host base URL env key is not configured.');
        }
        const baseUrl = process.env[baseUrlEnvName]?.trim();
        if (!baseUrl) {
            throw new Error(
                'Environment variable "' + baseUrlEnvName + '" is missing or empty (required by --base-url-env).'
            );
        }
        if (!requiresAuth) {
            return;
        }
        const authEnvName = process.env[META_AUTH_ENV_KEY]?.trim();
        if (!authEnvName) {
            throw new Error('Generated tools require auth; pass --auth-env <ENV_VAR_NAME> on the MCP host.');
        }
    },

    resolveHostContext(): ApiHostContext {
        const baseUrlKey = process.env[META_BASE_URL_ENV_KEY]?.trim();
        const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
        if (!baseUrl) {
            throw new Error(
                'Missing host base URL. Pass --base-url-env on mcp-serve.js and set the variable (or use smoke-generated).'
            );
        }

${resolveHostContextTail}
    },

    envDirsForReload(): string[] {
        const raw = process.env[META_ENV_DIRS];
        if (!raw?.trim()) {
            return [];
        }
        try {
            const dirs: unknown = JSON.parse(raw);
            if (Array.isArray(dirs) && dirs.every((d) => typeof d === 'string')) {
                return dirs;
            }
        } catch {
            // ignore malformed config
        }
        return [];
    }
};
`;
}
