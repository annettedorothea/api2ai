import chalk from 'chalk';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadLocalEnvFiles, readGeneratedModule } from '@core2ai/mcp-host';
import { applySmokeHostEnv } from './smoke-host-env.js';

type InvokeArgs = {
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

function defaultSmokeArgs(toolName: string): InvokeArgs {
    if (toolName === 'openMeteoForecast') {
        return {
            query: {
                latitude: 52.52,
                longitude: 13.41,
                hourly: 'temperature_2m',
                forecast_days: 1
            }
        };
    }
    if (toolName === 'getSpaceflightArticleById') {
        return {
            pathParams: {
                id: 1
            }
        };
    }
    return {};
}

function resolveSmokeHostRuntime(modulePath: string, requiresAuth: boolean): { baseUrl: string; credential?: string } {
    const base = path.basename(modulePath);
    if (base.includes('tmdb')) {
        const baseUrl = process.env.TMDB_BASE_URL?.trim();
        const credential = process.env.TMDB_ACCESS_TOKEN?.trim();
        if (!baseUrl) {
            throw new Error('Set TMDB_BASE_URL (e.g. https://api.themoviedb.org) for smoke-generated.');
        }
        if (requiresAuth && !credential) {
            throw new Error('Set TMDB_ACCESS_TOKEN for smoke-generated.');
        }
        return { baseUrl, credential };
    }
    if (base.includes('github')) {
        const baseUrl = process.env.GITHUB_BASE_URL?.trim() ?? 'https://api.github.com';
        const credential = process.env.GITHUB_TOKEN?.trim();
        if (requiresAuth && !credential) {
            throw new Error('Set GITHUB_TOKEN for smoke-generated.');
        }
        return { baseUrl, credential };
    }
    if (base.includes('open-meteo-geocoding')) {
        const baseUrl = process.env.OPEN_METEO_GEOCODING_BASE_URL?.trim() ?? 'https://geocoding-api.open-meteo.com';
        return { baseUrl };
    }
    if (base.includes('open-meteo')) {
        const baseUrl = process.env.OPEN_METEO_BASE_URL?.trim() ?? 'https://api.open-meteo.com';
        return { baseUrl };
    }
    if (base.includes('spaceflight')) {
        const baseUrl = process.env.SPACEFLIGHT_NEWS_BASE_URL?.trim() ?? 'https://api.spaceflightnewsapi.net';
        return { baseUrl };
    }
    if (base.includes('mock-api-tools')) {
        const baseUrl = process.env.MOCK_API_BASE_URL?.trim() ?? 'http://127.0.0.1:3847';
        const credential = process.env.MOCK_API_ACCESS_TOKEN?.trim();
        if (requiresAuth && !credential) {
            throw new Error(
                'Set MOCK_API_ACCESS_TOKEN (run: node mock-api/get-token.mjs alice in the demo workspace) and start demo:mock-api.'
            );
        }
        return { baseUrl, credential };
    }
    const baseUrl = process.env.API2AI_SMOKE_BASE_URL?.trim();
    if (!baseUrl) {
        throw new Error('Set API2AI_SMOKE_BASE_URL for smoke-generated on this module.');
    }
    return { baseUrl };
}

/** Integration smoke: one direct invokeTool call on a generated *-tools.mjs (no MCP stdio). */
export async function runSmokeGenerated(modulePath: string, toolName: string, argsJson?: string): Promise<void> {
    const envDirs = [process.cwd(), path.dirname(path.resolve(modulePath))];
    loadLocalEnvFiles(envDirs);

    if (modulePath.startsWith('file://')) {
        throw new Error('smoke-generated accepts local file paths only (no file:// URLs).');
    }
    const imported = await import(pathToFileURL(path.resolve(modulePath)).href);
    if (!imported || typeof imported !== 'object') {
        throw new Error(`Generated module "${modulePath}" did not export an object.`);
    }
    const generated = readGeneratedModule(imported as Record<string, unknown>);

    const tool = generated.generatedTools.find((item) => item.toolName === toolName);
    if (!tool) {
        const available = generated.generatedTools.map((item) => item.toolName).join(', ');
        console.error(chalk.red(`Tool "${toolName}" not found. Available tools: ${available}`));
        process.exit(1);
    }

    let args: InvokeArgs = {};
    if (argsJson) {
        try {
            const argsContent = argsJson.startsWith('@') ? fs.readFileSync(argsJson.slice(1), 'utf-8') : argsJson;
            args = JSON.parse(argsContent) as InvokeArgs;
        } catch (error) {
            console.error(chalk.red(`Invalid args JSON: ${error instanceof Error ? error.message : String(error)}`));
            process.exit(1);
        }
    }
    if (!argsJson) {
        args = defaultSmokeArgs(toolName);
    }

    const hostRuntime = resolveSmokeHostRuntime(modulePath, generated.requiresAuth === true);
    applySmokeHostEnv(generated.adapter, hostRuntime, envDirs);
    const result = await generated.invokeTool(toolName, args);
    console.log(JSON.stringify(result, null, 2));
}
