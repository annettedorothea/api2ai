import type { Model } from 'api-2-ai-dsl-language';
import { createApi2AiDslServices, Api2AiDslLanguageMetaData } from 'api-2-ai-dsl-language';
import chalk from 'chalk';
import { Command } from 'commander';
import { extractAstNode } from './util.js';
import { generateOutput } from './generator.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { runSmokeGenerated } from './smoke.js';
import { runMcpServerFromGeneratedModule } from './mcp-server.js';
import { loadLocalEnvFiles } from './env.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (source: string, destination: string): Promise<void> => {
    const services = createApi2AiDslServices(NodeFileSystem).Api2AiDsl;
    const model = await extractAstNode<Model>(source, services);
    const generatedFiles = generateOutput(model, source, destination);
    console.log(chalk.green(`Code generated succesfully:`));
    console.log(chalk.green(`- TS: ${generatedFiles.tsPath}`));
    console.log(chalk.green(`- JS: ${generatedFiles.jsPath}`));
};

export const smokeGeneratedAction = async (generatedModulePath: string, toolName: string, argsJson?: string): Promise<void> => {
    loadLocalEnvFiles([process.cwd(), path.dirname(path.resolve(generatedModulePath))]);
    await runSmokeGenerated(generatedModulePath, toolName, argsJson);
};

export const mcpServeGeneratedAction = async (generatedModulePath: string): Promise<void> => {
    loadLocalEnvFiles([process.cwd(), path.dirname(path.resolve(generatedModulePath))]);
    await runMcpServerFromGeneratedModule(generatedModulePath);
    console.error(`MCP server running from generated module: ${generatedModulePath}`);
};

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    // TODO: use Program API to declare the CLI
    const fileExtensions = Api2AiDslLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .argument('<destination>', 'destination file')
        .description('Generates code for a provided source file.')
        .action(generateAction);

    program
        .command('smoke-generated')
        .argument('<generatedModule>', 'generated JS module path (local file path)')
        .argument('<toolName>', 'tool name from generated module')
        .argument('[argsJson]', 'optional JSON args with pathParams/query/headers/body')
        .description('Runs one generated tool call directly from generated JS runtime module.')
        .action(smokeGeneratedAction);

    program
        .command('mcp-serve-generated')
        .argument('<generatedModule>', 'generated JS module path (local file path)')
        .description('Starts an MCP server over stdio exposing tools loaded from generated JS module.')
        .action(mcpServeGeneratedAction);

    program.parse(process.argv);
}
