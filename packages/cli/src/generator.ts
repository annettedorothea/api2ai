import type { Model } from 'api-2-ai-dsl-language';
import {
    ensureLoggingAdapterStubFromSource,
    ensureParentDir,
    resolveBootstrapProjectRootFromSource,
    resolveGeneratedCliDir,
    writeGeneratedDemosTestSupport,
    type ProjectBootstrapConfig
} from '@core2ai/core/codegen';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { renderBootstrap } from './generator/render-bootstrap.js';
import { renderCheckStubs } from './generator/render-check-stubs.js';
import { renderOAuthHttpMcpHost } from './generator/render-oauth-http-mcp-host.js';
import { renderStatelessHttpMcpHost } from './generator/render-stateless-http-mcp-host.js';
import { renderStdioMcpHost } from './generator/render-stdio-mcp-host.js';
import { renderToolsModule } from './generator/render-tools-module.js';

export type GeneratedOutputFiles = {
    tsPath: string;
    stdioMcpHostPath: string;
    statelessHttpMcpHostPath: string;
    oauthHttpMcpHostPath: string;
};

declare const __dirname: string | undefined;

function bundleSafeGeneratorImplementationDir(): string {
    if (typeof __dirname !== 'undefined' && __dirname.length > 0) {
        return __dirname;
    }
    return path.dirname(url.fileURLToPath(import.meta.url));
}

const __generatorDirname = bundleSafeGeneratorImplementationDir();

function createBootstrapConfig(): ProjectBootstrapConfig {
    return {
        hostProduct: 'api2ai',
        generatorImplementationDir: __generatorDirname,
        embedHomeEnv: 'API2AI_EMBED_HOME',
        fallbackProjectName: 'api2ai-project',
        requiredRuntimeDeps: ['@modelcontextprotocol/sdk', 'zod'],
        dependencyVersionFallbacks: {
            '@modelcontextprotocol/sdk': '^1.29.0',
            zod: '^4.4.3'
        },
        resolvePackageRoot(dir) {
            const oneUp = path.resolve(dir, '..');
            if (fs.existsSync(path.join(oneUp, 'package.json'))) {
                return oneUp;
            }
            return path.resolve(dir, '..', '..');
        },
        missingDepsMessage(pjsonPath, missing) {
            return `[generate] "${pjsonPath}": install MCP runtime dependencies: ${missing.join(', ')} (npm install), then generated/cli/stdio-mcp-server.js can run.`;
        }
    };
}

export async function generateOutput(model: Model, source: string, destination: string): Promise<GeneratedOutputFiles> {
    ensureParentDir(destination);
    const bootstrapConfig = createBootstrapConfig();
    const parsed = path.parse(destination);
    const tsPath = parsed.ext === '.ts' ? destination : path.join(parsed.dir, `${parsed.name}.ts`);

    const stubPaths = await renderCheckStubs(source, model, tsPath);
    const toolsModuleSource = await renderToolsModule({
        model,
        source,
        destinationTsPath: tsPath,
        stubPaths,
        bootstrapConfig
    });
    fs.writeFileSync(tsPath, toolsModuleSource);

    const cliDir = resolveGeneratedCliDir(tsPath);
    const stdioMcpHostPath = renderStdioMcpHost(cliDir, bootstrapConfig);
    const statelessHttpMcpHostPath = renderStatelessHttpMcpHost(cliDir, bootstrapConfig);
    const oauthHttpMcpHostPath = renderOAuthHttpMcpHost(cliDir, bootstrapConfig);
    const projectRoot = resolveBootstrapProjectRootFromSource(source);
    renderBootstrap(projectRoot, bootstrapConfig);
    ensureLoggingAdapterStubFromSource(source);
    writeGeneratedDemosTestSupport(projectRoot);

    return { tsPath, stdioMcpHostPath, statelessHttpMcpHostPath, oauthHttpMcpHostPath };
}
