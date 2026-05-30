import { Api2AiDslLanguageMetaData } from 'api-2-ai-dsl-language';
import { Command } from 'commander';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { generateAction } from './generate-command.js';
import { parseAction, validateAction } from './document-actions.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export default function (): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    // TODO: use Program API to declare the CLI
    const fileExtensions = Api2AiDslLanguageMetaData.fileExtensions.join(', ');

    program
        .command('parse')
        .argument('<file>', `source file (extensions: ${fileExtensions})`)
        .description('Parse an .api2ai file and report parser errors.')
        .action(parseAction);

    program
        .command('validate')
        .argument('<file>', `source file (extensions: ${fileExtensions})`)
        .description('Parse and run Langium validation on an .api2ai file.')
        .action(validateAction);

    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .argument('<destination>', 'destination file')
        .description('Generates code for a provided source file.')
        .action(generateAction);

    program.parse(process.argv);
}
