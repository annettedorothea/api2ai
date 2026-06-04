/**
 * Stateless HTTP MCP demo hosts (api2ai).
 */
import path from 'node:path';

export const HTTP_DEMOS = {
    'open-meteo': {
        tools: 'open-meteo-tools.js',
        baseUrlEnv: 'OPEN_METEO_BASE_URL',
        defaultBaseUrl: 'https://api.open-meteo.com',
        portEnv: 'OPEN_METEO_HTTP_PORT',
        defaultPort: 3848,
        mcpUrl: 'http://127.0.0.1:3848/mcp'
    },
    'spaceflight-news': {
        tools: 'spaceflight-news-tools.js',
        baseUrlEnv: 'SPACEFLIGHT_NEWS_BASE_URL',
        defaultBaseUrl: 'https://api.spaceflightnewsapi.net',
        portEnv: 'SPACEFLIGHT_NEWS_HTTP_PORT',
        defaultPort: 3849,
        mcpUrl: 'http://127.0.0.1:3849/mcp'
    },
    'mock-api': {
        tools: 'mock-api-tools.js',
        baseUrlEnv: 'MOCK_API_BASE_URL',
        defaultBaseUrl: 'http://127.0.0.1:3847',
        portEnv: 'MOCK_API_HTTP_PORT',
        defaultPort: 3850,
        mcpUrl: 'http://127.0.0.1:3850/mcp',
        prerequisite: 'mock-api backend on MOCK_API_BASE_URL (npm run demo:mock-api or init)'
    },
    'open-meteo-geocoding': {
        tools: 'open-meteo-geocoding-tools.js',
        baseUrlEnv: 'OPEN_METEO_GEOCODING_BASE_URL',
        defaultBaseUrl: 'https://geocoding-api.open-meteo.com',
        portEnv: 'OPEN_METEO_GEOCODING_HTTP_PORT',
        defaultPort: 3851,
        mcpUrl: 'http://127.0.0.1:3851/mcp'
    }
};

export const HTTP_DEMO_NAMES = Object.keys(HTTP_DEMOS);

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
    const hostJs = path.join(demosRoot, 'generated/cli/stateless-http-mcp-server.js');
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
    return { demo, port, args, mcpUrl: demo.mcpUrl };
}

export function listHttpPorts(env = process.env) {
    return HTTP_DEMO_NAMES.map((name) => resolvePort(HTTP_DEMOS[name], env));
}
