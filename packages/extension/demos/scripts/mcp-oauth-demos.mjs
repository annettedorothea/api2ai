/**
 * OAuth HTTP MCP demo hosts (api2ai) — keys match .cursor/mcp.json server names.
 */
import path from 'node:path';
import { requireEnv, requireEnvInt } from '../generated/api2ai/scripts/require-env.mjs';
import { productName } from '../generated/api2ai/scripts/project-meta.mjs';

/** @param {string[]} args @param {string} demosRoot @param {string | undefined} iconRel */
function appendIconArg(args, demosRoot, iconRel) {
    const rel = iconRel?.trim();
    if (!rel) {
        return;
    }
    args.push('--icon', path.resolve(demosRoot, rel));
}

export const OAUTH_HTTP_DEMOS = {
    bookings: {
        baseUrlEnv: 'BOOKINGS_API_BASE_URL',
        oauthIdpUrlEnv: 'BOOKINGS_OAUTH_IDP_OIDC_URL',
        portEnv: 'BOOKINGS_OAUTH_HTTP_PORT',
        oauthScope: 'bookings'
    },
    cakes: {
        baseUrlEnv: 'CAKES_API_BASE_URL',
        oauthIdpUrlEnv: 'BOOKINGS_OAUTH_IDP_URL',
        portEnv: 'CAKES_OAUTH_HTTP_PORT',
        oauthScope: 'cakes-api',
        icon: 'icons/cakes.png'
    },
    banking: {
        baseUrlEnv: 'BANKING_API_BASE_URL',
        oauthIdpUrlEnv: 'BANKING_OAUTH_IDP_URL',
        portEnv: 'BANKING_OAUTH_HTTP_PORT',
        oauthScope: 'banking',
        icon: 'icons/banking.png'
    }
};

/** OAuth MCP hosts started by `npm run start:mcp` / `start:all`. */
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
    const product = productName;
    const serverJs = path.join(demosRoot, 'generated', product, 'servers', `${name}-oauth-http-mcp-server.js`);
    const oauthScope = demo.oauthScope ?? name;
    const args = [
        serverJs,
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
    appendIconArg(args, demosRoot, demo.icon);
    const mcpUrl = `http://127.0.0.1:${port}/mcp`;
    return { demo, port, args, mcpUrl };
}

export function listOAuthHttpPorts(env = process.env) {
    return OAUTH_HTTP_DEMO_NAMES.map((name) => requireEnvInt(OAUTH_HTTP_DEMOS[name].portEnv, env));
}
