import type { Model } from 'api-2-ai-dsl-language';
import {
    assertGeneratedToolsDestinationMatchesHostProduct,
    ensureLoggingAdapterStubFromSource,
    ensureParentDir,
    resolveBootstrapProjectRootFromSource,
    resolveGeneratedCliDir,
    writeGeneratedDemosTestSupport,
    writeGeneratedMcpRuntimes,
    writeGeneratedModuleMcpServers,
    writeGeneratedScripts,
    type ProjectBootstrapConfig
} from '@toolfactory.dev/core/codegen';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
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

    const projectRoot = resolveBootstrapProjectRootFromSource(source);
    const cliDir = resolveGeneratedCliDir(tsPath);
    const mcpRuntimePaths = writeGeneratedMcpRuntimes(cliDir, bootstrapConfig, projectRoot);
    const moduleMcpServerPaths = writeGeneratedModuleMcpServers(tsPath);
    renderBootstrap(projectRoot, bootstrapConfig);
    ensureLoggingAdapterStubFromSource(source);
    writeGeneratedDemosTestSupport(projectRoot);
    writeGeneratedScripts(projectRoot);

    return {
        tsPath,
        mcpRuntimePaths,
        moduleMcpServerPaths
    };
}
