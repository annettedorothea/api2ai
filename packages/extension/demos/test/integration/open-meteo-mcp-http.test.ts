import { afterAll, describe, expect, it } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { compileGeneratedForSmoke, withMcpStatelessHttpSession } from '../generated/index.js';
import { copyLoggingAdapterStub, findFreePort } from '../support/bookings-api-fixture.js';
import { demosRoot, demosTmpRoot } from '../support/paths.js';
import { runDemoGenerate } from '../support/run-demo-generate.js';

const baseUrlEnv = 'OPEN_METEO_BASE_URL';

describe('open-meteo generated stateless-http-mcp-server (MCP HTTP)', () => {
    let runRoot = '';

    afterAll(async () => {
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    it('lists tools and calls openMeteoForecast via stateless HTTP', async () => {
        const port = await findFreePort();
        runRoot = await fs.mkdtemp(path.join(demosTmpRoot, 'open-meteo-http-'));
        const generatedTsPath = path.join(runRoot, 'generated/tools/open-meteo-tools.ts');
        await fs.mkdir(path.dirname(generatedTsPath), { recursive: true });
        runDemoGenerate(path.join(demosRoot, 'open-meteo.api2ai'), generatedTsPath);
        await copyLoggingAdapterStub(runRoot);
        compileGeneratedForSmoke(runRoot);

        const mcpUrl = `http://127.0.0.1:${port}/mcp`;
        await withMcpStatelessHttpSession(
            {
                statelessHttpMcpServerPath: path.join(runRoot, 'generated/cli/stateless-http-mcp-server.js'),
                generatedModulePath: path.join(runRoot, 'generated/tools/open-meteo-tools.js'),
                hostArgs: ['--base-url-env', baseUrlEnv, '--port', String(port), '--path', '/mcp'],
                mcpUrl,
                cwd: runRoot,
                env: {
                    [baseUrlEnv]: 'https://api.open-meteo.com'
                },
                timeoutMs: 60_000
            },
            async (session) => {
                const toolNames = await session.listToolNames();
                expect(toolNames).toContain('openMeteoForecast');

                const response = await session.callTool('openMeteoForecast', {
                    query: {
                        latitude: 52.52,
                        longitude: 13.41,
                        hourly: ['temperature_2m']
                    }
                });
                expect(response).toMatchObject({
                    latitude: expect.any(Number),
                    longitude: expect.any(Number)
                });
            }
        );
    }, 60_000);
});
