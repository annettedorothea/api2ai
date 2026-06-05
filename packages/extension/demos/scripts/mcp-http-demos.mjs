/**
 * Stateless HTTP MCP demo hosts (api2ai) — keys match .cursor/mcp.json server names.
 */
import path from 'node:path';

export const HTTP_DEMOS = {
    'spaceflight-news': {
        tools: 'spaceflight-news-tools.js',
        baseUrlEnv: 'SPACEFLIGHT_NEWS_BASE_URL',
        defaultBaseUrl: 'https://api.spaceflightnewsapi.net',
        portEnv: 'SPACEFLIGHT_NEWS_HTTP_PORT',
        defaultPort: 3849
    },
    todo: {
        tools: 'todo-tools.js',
        baseUrlEnv: 'TODO_API_BASE_URL',
        defaultBaseUrl: 'http://127.0.0.1:3852',
        portEnv: 'TODO_HTTP_PORT',
        defaultPort: 3853,
        prerequisite: 'todo-api backend :3852',
        credentialValidation: 'static',
        authExpectedEnv: 'TODO_API_KEY'
    }
};

/** Hosts started by `npm run init` (HTTP entries in .cursor/mcp.json). */
export const HTTP_INIT_DEMO_NAMES = ['spaceflight-news', 'todo'];

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
    if (demo.credentialValidation) {
        args.push('--credential-validation', demo.credentialValidation);
        if (demo.authExpectedEnv) {
            args.push('--auth-expected-env', demo.authExpectedEnv);
        }
    }
    const mcpUrl = `http://127.0.0.1:${port}/mcp`;
    return { demo, port, args, mcpUrl, credentialValidation: demo.credentialValidation };
}

export function listHttpPorts(env = process.env) {
    return HTTP_DEMO_NAMES.map((name) => resolvePort(HTTP_DEMOS[name], env));
}
