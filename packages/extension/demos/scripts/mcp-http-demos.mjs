/**
 * Relay HTTP MCP demo hosts (api2ai) — keys match .cursor/mcp.json server names.
 */
import path from 'node:path';
import { requireEnv, requireEnvInt, warnEnvIfMissing } from '../generated/api2ai/scripts/require-env.mjs';
import { productName } from '../generated/api2ai/scripts/project-meta.mjs';

/**
 * @param {string} demoName
 * @param {string} hostKind
 */
function moduleServerFile(demoName, hostKind) {
    return `${demoName}-${hostKind}-mcp-server.js`;
}

export const HTTP_DEMOS = {
    'open-meteo': {
        hostKind: 'public-http',
        baseUrlEnv: 'OPEN_METEO_BASE_URL',
        portEnv: 'OPEN_METEO_HTTP_PORT'
    },
    'open-meteo-geocoding': {
        hostKind: 'public-http',
        baseUrlEnv: 'OPEN_METEO_GEOCODING_BASE_URL',
        portEnv: 'OPEN_METEO_GEOCODING_HTTP_PORT'
    },
    github: {
        hostKind: 'passthrough-http',
        baseUrlEnv: 'GITHUB_BASE_URL',
        portEnv: 'GITHUB_HTTP_PORT',
        authEnv: 'GITHUB_TOKEN'
    },
    tmdb: {
        hostKind: 'passthrough-http',
        baseUrlEnv: 'TMDB_BASE_URL',
        portEnv: 'TMDB_HTTP_PORT',
        authEnv: 'TMDB_ACCESS_TOKEN'
    },
    xquik: {
        hostKind: 'passthrough-http',
        baseUrlEnv: 'XQUIK_BASE_URL',
        portEnv: 'XQUIK_HTTP_PORT',
        authEnv: 'XQUIK_API_KEY',
        mcpAuthHeaderEnv: 'XQUIK_MCP_AUTH_HEADER',
        authExpectedEnv: 'XQUIK_API_KEY'
    },
    'spaceflight-news': {
        hostKind: 'public-http',
        baseUrlEnv: 'SPACEFLIGHT_NEWS_BASE_URL',
        portEnv: 'SPACEFLIGHT_NEWS_HTTP_PORT'
    },
    todo: {
        hostKind: 'passthrough-http',
        baseUrlEnv: 'TODO_API_BASE_URL',
        portEnv: 'TODO_HTTP_PORT',
        mcpAuthHeaderEnv: 'TODO_MCP_AUTH_HEADER',
        authExpectedEnv: 'TODO_API_KEY'
    }
};

/** Hosts started by `npm run start:mcp` / `start:all` (HTTP entries in .cursor/mcp.json). */
export const HTTP_START_DEMO_NAMES = [
    'open-meteo',
    'open-meteo-geocoding',
    'github',
    'tmdb',
    'xquik',
    'spaceflight-news',
    'todo'
];

export const HTTP_DEMO_NAMES = Object.keys(HTTP_DEMOS);

/**
 * @param {typeof HTTP_DEMOS[string]} demo
 * @param {NodeJS.ProcessEnv} env
 */
export function resolveMcpAuthHeader(demo, env = process.env) {
    const perDemoKey = demo.mcpAuthHeaderEnv?.trim();
    if (perDemoKey) {
        return requireEnv(perDemoKey, env);
    }
    return requireEnv('MCP_AUTH_HEADER', env);
}

/**
 * @param {string} name
 * @param {string} demosRoot
 * @param {NodeJS.ProcessEnv} env
 */
export function buildHostLaunch(name, demosRoot, env) {
    const demo = HTTP_DEMOS[name];
    if (!demo) {
        throw new Error(`Unknown http demo: ${name}`);
    }
    requireEnv(demo.baseUrlEnv, env);
    const port = requireEnvInt(demo.portEnv, env);
    const product = productName;
    const serverJs = path.join(
        demosRoot,
        'generated',
        product,
        'servers',
        moduleServerFile(name, demo.hostKind)
    );
    const args = [serverJs, '--base-url-env', demo.baseUrlEnv, '--port', String(port), '--path', '/mcp'];
    if (demo.authEnv) {
        args.push('--auth-env', demo.authEnv);
    }
    const mcpUrl = `http://127.0.0.1:${port}/mcp`;
    const mcpAuthHeader = demo.mcpAuthHeaderEnv ? resolveMcpAuthHeader(demo, env) : undefined;
    const hostEnv = mcpAuthHeader ? { MCP_AUTH_HEADER: mcpAuthHeader } : {};
    for (const secretEnv of new Set([demo.authExpectedEnv, demo.authEnv].filter(Boolean))) {
        warnEnvIfMissing(secretEnv, env);
    }
    return { demo, port, args, mcpUrl, mcpAuthHeader, hostEnv };
}

export function listHttpPorts(env = process.env) {
    return HTTP_DEMO_NAMES.map((name) => requireEnvInt(HTTP_DEMOS[name].portEnv, env));
}
