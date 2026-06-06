/**
 * OAuth HTTP MCP demo hosts (api2ai) — keys match .cursor/mcp.json server names.
 */
import path from 'node:path';

export const OAUTH_HTTP_DEMOS = {
    'bookings-oauth': {
        tools: 'bookings-api-tools.js',
        baseUrlEnv: 'BOOKINGS_API_BASE_URL',
        defaultBaseUrl: 'http://127.0.0.1:3847',
        oauthIdpUrlEnv: 'BOOKINGS_OAUTH_IDP_OIDC_URL',
        defaultOAuthIdpUrl: 'http://127.0.0.1:3861',
        portEnv: 'BOOKINGS_OAUTH_HTTP_PORT',
        defaultPort: 3872,
        tokenValidation: 'oidc',
        oauthScope: 'bookings-api',
        mcpServerName: 'bookings-oauth',
        prerequisite: 'bookings-api :3847 + oauth-idp-oidc :3861 (RS256)'
    },
    cakes: {
        tools: 'cakes-tools.js',
        baseUrlEnv: 'CAKES_API_BASE_URL',
        defaultBaseUrl: 'http://127.0.0.1:3856',
        oauthIdpUrlEnv: 'BOOKINGS_OAUTH_IDP_URL',
        defaultOAuthIdpUrl: 'http://127.0.0.1:3860',
        portEnv: 'CAKES_OAUTH_HTTP_PORT',
        defaultPort: 3874,
        tokenValidation: 'opaque',
        oauthScope: 'cakes-api',
        mcpServerName: 'cakes',
        prerequisite: 'cakes-api :3856 + oauth-idp :3860'
    },
    'banking-oauth': {
        tools: 'banking-tools.js',
        baseUrlEnv: 'BANKING_API_BASE_URL',
        defaultBaseUrl: 'http://127.0.0.1:3858',
        oauthIdpUrlEnv: 'ENTERPRISE_IDP_URL',
        defaultOAuthIdpUrl: 'http://127.0.0.1:3862',
        portEnv: 'BANKING_OAUTH_HTTP_PORT',
        defaultPort: 3876,
        tokenValidation: 'opaque',
        oauthScope: 'banking-api',
        mcpServerName: 'banking-oauth',
        credentialTransformModule: 'src/auth/banking-tools/credentialTransform.js',
        prerequisite:
            'banking-api :3858 + enterprise-idp :3862; --credential-transform-module src/auth/banking-tools/credentialTransform.js'
    }
};

/** OAuth MCP hosts started by `npm run init`. */
export const OAUTH_HTTP_INIT_DEMO_NAMES = ['bookings-oauth', 'cakes', 'banking-oauth'];

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
    if (demo.baseUrlEnv && !env[demo.baseUrlEnv]?.trim()) {
        env[demo.baseUrlEnv] = demo.defaultBaseUrl;
    }
    if (!env[demo.oauthIdpUrlEnv]?.trim()) {
        env[demo.oauthIdpUrlEnv] = demo.defaultOAuthIdpUrl;
    }
    const port = resolvePort(demo, env);
    const hostJs = path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js');
    const toolsJs = path.join(demosRoot, 'generated/tools', demo.tools);
    const tokenValidation = demo.tokenValidation;
    const oauthScope = demo.oauthScope ?? name;
    const args = [
        hostJs,
        toolsJs,
        '--base-url-env',
        demo.baseUrlEnv,
        '--oauth-idp-url',
        env[demo.oauthIdpUrlEnv],
        '--oauth-scope',
        oauthScope,
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
    }
    if (demo.credentialTransformModule) {
        const fromEnv = env.CREDENTIAL_TRANSFORM_MODULE?.trim();
        const rel = fromEnv || demo.credentialTransformModule;
        args.push('--credential-transform-module', path.join(demosRoot, rel));
    }
    const mcpUrl = `http://127.0.0.1:${port}/mcp`;
    return { demo, port, args, mcpUrl, tokenValidation };
}

export function listOAuthHttpPorts(env = process.env) {
    return OAUTH_HTTP_DEMO_NAMES.map((name) => resolvePort(OAUTH_HTTP_DEMOS[name], env));
}
