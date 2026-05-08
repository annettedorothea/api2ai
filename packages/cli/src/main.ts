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
import { runSmokeTest } from './smoke.js';
import { runMcpServer } from './mcp-server.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (source: string, destination: string): Promise<void> => {
    const services = createApi2AiDslServices(NodeFileSystem).Api2AiDsl;
    const model = await extractAstNode<Model>(source, services);
    const generatedFilePath = generateOutput(model, source, destination);
    console.log(chalk.green(`Code generated succesfully: ${generatedFilePath}`));
};

export const smokeAction = async (source: string, toolName: string, argsJson?: string): Promise<void> => {
    const services = createApi2AiDslServices(NodeFileSystem).Api2AiDsl;
    const model = await extractAstNode<Model>(source, services);
    await runSmokeTest(model, model.baseUrl, toolName, argsJson);
};

export const mcpServeAction = async (source: string): Promise<void> => {
    const services = createApi2AiDslServices(NodeFileSystem).Api2AiDsl;
    const model = await extractAstNode<Model>(source, services);
    await runMcpServer(model, model.baseUrl);
    console.error(`MCP server running for ${model.operations.length} tools`);
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
        .command('smoke')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .argument('<toolName>', 'tool name from the DSL')
        .argument('[argsJson]', 'optional JSON args with pathParams/query/headers/body')
        .description('Runs one generated tool call directly without MCP, using baseUrl from the DSL.')
        .action(smokeAction);

    program
        .command('mcp-serve')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .description('Starts an MCP server over stdio exposing all DSL tools, using baseUrl from the DSL.')
        .action(mcpServeAction);

    program.parse(process.argv);
}
