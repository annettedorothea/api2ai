import { Api2AiDslLanguageMetaData } from 'api-2-ai-dsl-language';
import { Command } from 'commander';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { runSmokeGenerated } from '../test/integration/smoke-generated.js';
import { loadLocalEnvFiles } from '../mcp-bundle/env.js';
import { generateAction } from './generate-command.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const smokeGeneratedAction = async (generatedModulePath: string, toolName: string, argsJson?: string): Promise<void> => {
    loadLocalEnvFiles([process.cwd(), path.dirname(path.resolve(generatedModulePath))]);
    await runSmokeGenerated(generatedModulePath, toolName, argsJson);
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

    program.parse(process.argv);
}
