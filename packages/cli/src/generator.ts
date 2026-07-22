import type { Model } from 'api-2-ai-dsl-language';
import {
    assertGeneratedToolsDestinationMatchesHostProduct,
    ensureParentDir,
    resolveBootstrapProjectRootFromSource,
    resolveGeneratedCliDir,
    writeGeneratedDemosTestSupport,
    writeGeneratedScripts,
    writeMcpBuildGeneratedAtModule,
    writeMcpRuntimes as writeMcpRuntimesCore,
    writeMcpServers,
    type ProjectBootstrapConfig
} from '@toolfactory.dev/core/codegen';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { renderOAuthHttpRuntimeCompose } from './codegen/templates/oauth-http-runtime.compose.js';
import {
    renderPassthroughHttpRuntimeCompose,
    renderPublicHttpRuntimeCompose
} from './codegen/templates/http-runtime.compose.js';
import { renderStdioRuntimeCompose } from './codegen/templates/stdio-runtime.compose.js';
import { renderBootstrap } from './generator/render-bootstrap.js';
import { renderCheckStubs } from './generator/render-check-stubs.js';
import { renderToolsModule } from './generator/render-tools-module.js';

export type GeneratedOutputFiles = {
    tsPath: string;
    mcpRuntimePaths: {
        stdioRuntimePath: string;
        publicHttpRuntimePath: string;
        passthroughHttpRuntimePath: string;
        oauthHttpRuntimePath: string;
    };
    moduleMcpServerPaths: string[];
};

declare const __dirname: string | undefined;

function bundleSafeGeneratorImplementationDir(): string {
    if (typeof __dirname !== 'undefined' && __dirname.length > 0) {
        return __dirname;
    }
    return path.dirname(url.fileURLToPath(import.meta.url));
}

const __generatorDirname = bundleSafeGeneratorImplementationDir();

const MCP_RUNTIME_RENDERERS = {
    renderStdioRuntime: renderStdioRuntimeCompose,
    renderPublicHttpRuntime: renderPublicHttpRuntimeCompose,
    renderPassthroughHttpRuntime: renderPassthroughHttpRuntimeCompose,
    renderOAuthHttpRuntime: renderOAuthHttpRuntimeCompose
} as const;

function writeMcpRuntimes(cliDir: string, projectRoot?: string) {
    return writeMcpRuntimesCore(cliDir, MCP_RUNTIME_RENDERERS, projectRoot);
}

function createBootstrapConfig(): ProjectBootstrapConfig {
    return {
        hostProduct: 'api2ai',
        generatorImplementationDir: __generatorDirname,
        embedHomeEnv: 'API2AI_EMBED_HOME',
        fallbackProjectName: 'api2ai-project',
        requiredRuntimeDeps: ['@modelcontextprotocol/sdk', 'zod', '@toolfactory.dev/core'],
        dependencyVersionFallbacks: {
            '@modelcontextprotocol/sdk': '^1.29.0',
            zod: '^4.4.3',
            '@toolfactory.dev/core': '^1.0.1'
        },
        resolvePackageRoot(dir) {
            const oneUp = path.resolve(dir, '..');
            if (fs.existsSync(path.join(oneUp, 'package.json'))) {
                return oneUp;
            }
            return path.resolve(dir, '..', '..');
        },
        missingDepsMessage(pjsonPath, missing) {
            return `[generate] "${pjsonPath}": install MCP runtime dependencies: ${missing.join(', ')} (npm install), then run a generated servers/*-mcp-server.js host.`;
        }
    };
}

export async function generateOutput(model: Model, source: string, destination: string): Promise<GeneratedOutputFiles> {
    ensureParentDir(destination);
    const bootstrapConfig = createBootstrapConfig();
    const parsed = path.parse(destination);
    const tsPath = parsed.ext === '.ts' ? destination : path.join(parsed.dir, `${parsed.name}.ts`);
    const hostProduct = bootstrapConfig.hostProduct;
    if (!hostProduct) {
        throw new Error('Codegen: bootstrapConfig.hostProduct is required (api2ai or db2ai).');
    }
    assertGeneratedToolsDestinationMatchesHostProduct(tsPath, hostProduct);

    const stubPaths = await renderCheckStubs(source, model, tsPath);
    const toolsModuleSource = await renderToolsModule({
        model,
        source,
        destinationTsPath: tsPath,
        stubPaths,
        bootstrapConfig
    });
    fs.writeFileSync(tsPath, toolsModuleSource);
    writeMcpBuildGeneratedAtModule(tsPath);

    const projectRoot = resolveBootstrapProjectRootFromSource(source);
    const cliDir = resolveGeneratedCliDir(tsPath);
    const mcpRuntimePaths = writeMcpRuntimes(cliDir, projectRoot);
    const moduleMcpServerPaths = writeMcpServers(tsPath);
    renderBootstrap(projectRoot, bootstrapConfig);
    writeGeneratedScripts(projectRoot, 'api2ai');
    writeGeneratedDemosTestSupport(projectRoot);

    return {
        tsPath,
        mcpRuntimePaths,
        moduleMcpServerPaths
    };
}
