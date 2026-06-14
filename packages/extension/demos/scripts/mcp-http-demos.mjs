/**
 * Relay HTTP MCP demo hosts (api2ai) — keys match .cursor/mcp.json server names.
 */
import path from 'node:path';

const DEFAULT_MCP_AUTH_HEADER = 'x-api-token';

export const HTTP_DEMOS = {
    'spaceflight-news': {
        host: 'public-http-mcp-server.js',
        tools: 'spaceflight-news-tools.js',
        baseUrlEnv: 'SPACEFLIGHT_NEWS_BASE_URL',
        defaultBaseUrl: 'https://api.spaceflightnewsapi.net',
        portEnv: 'SPACEFLIGHT_NEWS_HTTP_PORT',
        defaultPort: 3849
    },
    todo: {
        host: 'passthrough-http-mcp-server.js',
        tools: 'todo-tools.js',
        baseUrlEnv: 'TODO_API_BASE_URL',
        defaultBaseUrl: 'http://127.0.0.1:3852',
        portEnv: 'TODO_HTTP_PORT',
        defaultPort: 3853,
        prerequisite: 'todo-api backend :3852',
        mcpAuthHeaderEnv: 'TODO_MCP_AUTH_HEADER',
        defaultMcpAuthHeader: DEFAULT_MCP_AUTH_HEADER,
        authExpectedEnv: 'TODO_API_KEY'
    }
};

/** Hosts started by `npm run start` (HTTP entries in .cursor/mcp.json). */
export const HTTP_START_DEMO_NAMES = ['spaceflight-news', 'todo'];

export const HTTP_DEMO_NAMES = Object.keys(HTTP_DEMOS);

/**
 * MCP client auth header name for this host (Cursor mcp.json `headers.*` must match).
 * Per-demo env → global MCP_AUTH_HEADER → demo default → x-api-token.
 *
 * @param {typeof HTTP_DEMOS[string]} demo
 * @param {NodeJS.ProcessEnv} env
 */
export function resolveMcpAuthHeader(demo, env = process.env) {
    const perDemoKey = demo.mcpAuthHeaderEnv?.trim();
    if (perDemoKey) {
        const perDemo = env[perDemoKey]?.trim();
        if (perDemo) {
            return perDemo;
        }
    }
    const global = env.MCP_AUTH_HEADER?.trim();
    if (global) {
        return global;
    }
    const fallback = demo.defaultMcpAuthHeader?.trim();
    if (fallback) {
        return fallback;
    }
    return DEFAULT_MCP_AUTH_HEADER;
}

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
export function buildHostLaunch(name, demosRoot, env) {
    const demo = HTTP_DEMOS[name];
    if (!demo) {
        throw new Error(`Unknown http demo: ${name}`);
    }
    if (!env[demo.baseUrlEnv]?.trim()) {
        env[demo.baseUrlEnv] = demo.defaultBaseUrl;
    }
    const port = resolvePort(demo, env);
    const hostJs = path.join(demosRoot, 'generated/cli', demo.host);
    const toolsJs = path.join(demosRoot, 'generated/tools', demo.tools);
    const args = [
        hostJs,
        toolsJs,
        '--base-url-env',
        demo.baseUrlEnv,
        '--port',
        String(port),
        '--path',
        '/mcp'
    ];
    const mcpUrl = `http://127.0.0.1:${port}/mcp`;
    const mcpAuthHeader = resolveMcpAuthHeader(demo, env);
    const hostEnv = { MCP_AUTH_HEADER: mcpAuthHeader };
    return { demo, port, args, mcpUrl, mcpAuthHeader, hostEnv };
}

export function listHttpPorts(env = process.env) {
    return HTTP_DEMO_NAMES.map((name) => resolvePort(HTTP_DEMOS[name], env));
}
