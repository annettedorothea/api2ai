/**
 * OAuth + stateful HTTP MCP demo hosts (api2ai).
 */
import path from 'node:path';

export const OAUTH_HTTP_DEMOS = {
    'bookings-api': {
        tools: 'bookings-api-tools.js',
        baseUrlEnv: 'BOOKINGS_API_BASE_URL',
        defaultBaseUrl: 'http://127.0.0.1:3847',
        oauthIdpUrlEnv: 'BOOKINGS_API_OAUTH_IDP_URL',
        defaultOAuthIdpUrl: 'http://127.0.0.1:3860',
        jwtSecretEnv: 'BOOKINGS_API_JWT_SECRET',
        portEnv: 'BOOKINGS_API_OAUTH_HTTP_PORT',
        defaultPort: 3870,
        mcpUrl: 'http://127.0.0.1:3870/mcp',
        prerequisite: 'bookings-api backend + oauth-idp (npm run demo:bookings-api, demo:oauth-idp)'
    }
};

export const OAUTH_HTTP_DEMO_NAMES = Object.keys(OAUTH_HTTP_DEMOS);

export function resolvePort(demo, env = process.env) {
    const raw = env[demo.portEnv];
    if (raw === undefined || raw.trim() === '') {
        return demo.defaultPort;
    }
    const port = Number.parseInt(raw, 10);
    if (!Number.isFinite(port) || port <= 0) {
        throw new Error(`Invalid ${demo.portEnv}: ${raw}`);
    }
    return port;
}

/**
 * @param {string} name
 * @param {string} demosRoot
 * @param {NodeJS.ProcessEnv} env
 */
export function buildOAuthHostLaunch(name, demosRoot, env) {
    const demo = OAUTH_HTTP_DEMOS[name];
    if (!demo) {
        throw new Error(`Unknown oauth http demo: ${name}`);
    }
    if (!env[demo.baseUrlEnv]?.trim()) {
        env[demo.baseUrlEnv] = demo.defaultBaseUrl;
    }
    if (!env[demo.oauthIdpUrlEnv]?.trim()) {
        env[demo.oauthIdpUrlEnv] = demo.defaultOAuthIdpUrl;
    }
    const port = resolvePort(demo, env);
    const hostJs = path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js');
    const toolsJs = path.join(demosRoot, 'generated/tools', demo.tools);
    const tokenValidation = (env.OAUTH_TOKEN_VALIDATION ?? 'hs256').trim();
    const args = [
        hostJs,
        toolsJs,
        '--base-url-env',
        demo.baseUrlEnv,
        '--oauth-idp-url',
        env[demo.oauthIdpUrlEnv],
        '--oauth-scope',
        name,
        '--oauth-token-validation',
        tokenValidation,
        '--port',
        String(port),
        '--path',
        '/mcp'
    ];
    if (tokenValidation === 'oidc') {
        const issuer = (env.OAUTH_ISSUER ?? env[demo.oauthIdpUrlEnv]).trim();
        args.push('--oauth-issuer', issuer);
        const audience = env.OAUTH_AUDIENCE?.trim();
        if (audience) {
            args.push('--oauth-audience', audience);
        }
    } else {
        args.push('--jwt-secret-env', demo.jwtSecretEnv);
    }
    return { demo, port, args, mcpUrl: demo.mcpUrl };
}

export function listOAuthHttpPorts(env = process.env) {
    return OAUTH_HTTP_DEMO_NAMES.map((name) => resolvePort(OAUTH_HTTP_DEMOS[name], env));
}
