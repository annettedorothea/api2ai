/**
 * OAuth HTTP MCP demo hosts (api2ai) — keys match .cursor/mcp.json server names.
 */
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { requireEnv, requireEnvInt } from './generated/require-env.mjs';

function loadProductName(demosRoot) {
    const config = JSON.parse(readFileSync(path.join(demosRoot, 'project-generate.config.json'), 'utf-8'));
    return config.productName;
}

export const OAUTH_HTTP_DEMOS = {
    'bookings': {
        tools: 'bookings-tools.js',
        baseUrlEnv: 'BOOKINGS_API_BASE_URL',
        oauthIdpUrlEnv: 'BOOKINGS_OAUTH_IDP_OIDC_URL',
        portEnv: 'BOOKINGS_OAUTH_HTTP_PORT',
        oauthScope: 'bookings'
    },
    cakes: {
        tools: 'cakes-tools.js',
        baseUrlEnv: 'CAKES_API_BASE_URL',
        oauthIdpUrlEnv: 'BOOKINGS_OAUTH_IDP_URL',
        portEnv: 'CAKES_OAUTH_HTTP_PORT',
        oauthScope: 'cakes-api'
    },
    'banking': {
        tools: 'banking-tools.js',
        baseUrlEnv: 'BANKING_API_BASE_URL',
        oauthIdpUrlEnv: 'ENTERPRISE_IDP_URL',
        portEnv: 'BANKING_OAUTH_HTTP_PORT',
        oauthScope: 'banking-api'
    }
};

/** OAuth MCP hosts started by `npm run start`. */
export const OAUTH_HTTP_START_DEMO_NAMES = ['bookings', 'cakes', 'banking'];

export const OAUTH_HTTP_DEMO_NAMES = Object.keys(OAUTH_HTTP_DEMOS);

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
    requireEnv(demo.baseUrlEnv, env);
    const oauthIdpUrl = requireEnv(demo.oauthIdpUrlEnv, env);
    const port = requireEnvInt(demo.portEnv, env);
    const product = loadProductName(demosRoot);
    const hostJs = path.join(demosRoot, 'generated', product, 'cli', 'oauth-http-mcp-server.js');
    const toolsJs = path.join(demosRoot, 'generated', product, 'tools', demo.tools);
    const oauthScope = demo.oauthScope ?? name;
    const args = [
        hostJs,
        toolsJs,
        '--base-url-env',
        demo.baseUrlEnv,
        '--oauth-idp-url',
        oauthIdpUrl,
        '--oauth-scope',
        oauthScope,
        '--port',
        String(port),
        '--path',
        '/mcp'
    ];
    const mcpUrl = `http://127.0.0.1:${port}/mcp`;
    return { demo, port, args, mcpUrl };
}

export function listOAuthHttpPorts(env = process.env) {
    return OAUTH_HTTP_DEMO_NAMES.map((name) => requireEnvInt(OAUTH_HTTP_DEMOS[name].portEnv, env));
}
