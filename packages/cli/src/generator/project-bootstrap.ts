import * as fs from 'node:fs';
import * as path from 'node:path';
import {
    copyBundledMcpServeInto as copyCoreBundledMcpServeInto,
    ensureParentDir,
    resolveBootstrapProjectRootFromSource,
    resolveGeneratedCliDir,
    resolveMcpServerIdentityFromDestination as resolveCoreMcpServerIdentityFromDestination,
    writeMinimalPackageJsonIfAbsent as writeCoreMinimalPackageJsonIfAbsent,
    type ProjectBootstrapConfig
} from '@core2ai/codegen';

function createBootstrapConfig(generatorImplementationDir: string): ProjectBootstrapConfig {
    return {
        generatorImplementationDir,
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
        bundledMcpMissingMessage(src) {
            return `Bundled MCP host missing (${src}). Run npm run bundle:mcp-runtime from the workspace root.`;
        },
        missingDepsMessage(pjsonPath, missing) {
            return `[generate] "${pjsonPath}": install MCP runtime dependencies: ${missing.join(', ')} (npm install), then generated/cli/mcp-serve.mjs can run.`;
        }
    };
}

function withConfig<T>(generatorImplementationDir: string, fn: (config: ProjectBootstrapConfig) => T): T {
    return fn(createBootstrapConfig(generatorImplementationDir));
}

export { ensureParentDir, resolveBootstrapProjectRootFromSource, resolveGeneratedCliDir };

export function copyBundledMcpServeInto(cliDir: string, generatorImplementationDir: string): string {
    return withConfig(generatorImplementationDir, (config) => copyCoreBundledMcpServeInto(cliDir, config));
}

export function resolveMcpServerIdentityFromDestination(
    destinationTsPath: string,
    generatorImplementationDir: string
): { name: string; version: string } {
    return withConfig(generatorImplementationDir, (config) =>
        resolveCoreMcpServerIdentityFromDestination(destinationTsPath, config)
    );
}

export function writeMinimalPackageJsonIfAbsent(projectRoot: string, generatorImplementationDir: string): void {
    withConfig(generatorImplementationDir, (config) => writeCoreMinimalPackageJsonIfAbsent(projectRoot, config));
}
