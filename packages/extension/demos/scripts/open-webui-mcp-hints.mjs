/**
 * Copy-paste hints for Open WebUI External Tools (HTTP MCP).
 */
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';
import { requireEnv, requireEnvInt } from './generated/require-env.mjs';
import { HTTP_START_DEMO_NAMES, HTTP_DEMOS } from './mcp-http-demos.mjs';
import { OAUTH_HTTP_START_DEMO_NAMES, OAUTH_HTTP_DEMOS } from './mcp-oauth-demos.mjs';

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {{ name: string, port: number, auth: string, url: string, headers?: string }[]}
 */
export function buildOpenWebUiHttpMcpEntries(env = process.env) {
    return HTTP_START_DEMO_NAMES.map((name) => {
        const demo = HTTP_DEMOS[name];
        const port = requireEnvInt(demo.portEnv, env);
        const entry = {
            name,
            port,
            auth: 'None',
            url: `http://127.0.0.1:${port}/mcp`
        };
        if (demo.authExpectedEnv) {
            const headerName = demo.mcpAuthHeaderEnv ? requireEnv(demo.mcpAuthHeaderEnv, env) : 'x-api-token';
            const headerValue = requireEnv(demo.authExpectedEnv, env);
            entry.headers = JSON.stringify({ [headerName]: headerValue });
        }
        return entry;
    });
}

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function buildOpenWebUiOAuthMcpEntries(env = process.env) {
    return OAUTH_HTTP_START_DEMO_NAMES.map((name) => {
        const demo = OAUTH_HTTP_DEMOS[name];
        const port = requireEnvInt(demo.portEnv, env);
        return {
            name,
            port,
            auth: 'OAuth 2.1',
            url: `http://127.0.0.1:${port}/mcp`,
            clientId: 'mcp-demo-local',
            oauthServerUrl: requireEnv(demo.oauthIdpUrlEnv, env)
        };
    });
}

/**
 * @param {number} openWebUiPort
 * @param {NodeJS.ProcessEnv} env
 */
export function printOpenWebUiMcpHints(openWebUiPort, env = process.env) {
    loadProjectEnvLocal();
    const httpEntries = buildOpenWebUiHttpMcpEntries(env);
    const oauthEntries = buildOpenWebUiOAuthMcpEntries(env);

    console.log('');
    console.log('[open-webui] Admin Settings → External Tools → MCP (Streamable HTTP)');
    console.log('[open-webui] UI: http://127.0.0.1:' + openWebUiPort);
    console.log('[open-webui] All MCP URLs use 127.0.0.1 (native Open WebUI on the host).');
    console.log('[open-webui] Phase 1: Verify Connection — no LLM required.');
    console.log('');

    for (const entry of httpEntries) {
        console.log(`--- ${entry.name} (HTTP) ---`);
        console.log(`  URL:     ${entry.url}`);
        console.log(`  Auth:    ${entry.auth}`);
        if (entry.headers) {
            console.log(`  Headers: ${entry.headers}`);
        }
        console.log('');
    }

    for (const entry of oauthEntries) {
        console.log(`--- ${entry.name} (OAuth) ---`);
        console.log(`  URL:              ${entry.url}`);
        console.log(`  Auth:             ${entry.auth}`);
        console.log(`  Client ID:        ${entry.clientId}`);
        console.log(`  Client Secret:    (empty or demo — public client)`);
        console.log(`  OAuth Server URL: ${entry.oauthServerUrl}`);
        console.log(`  Note: enable tool per chat; complete browser login (alice/bob/admin).`);
        console.log('');
    }

    console.log('[open-webui] Phase 2 (chat): Admin → Connections → Groq or Ollama; Function Calling = Native.');
    console.log('[open-webui] Stop UI only: npm run open-webui:down');
    console.log('[open-webui] Stop demos + UI: npm run demo:kill-all && npm run open-webui:down');
}
