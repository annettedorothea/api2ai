/**
 * Separate CLI entry bundled into the VS Code extension VSIX ({@see packages/extension/scripts/embed-cli-bundle.mjs}).
 * Excluded from the normal `packages/cli` TypeScript compile (see tsconfig.exclude).
 */
import { Api2AiDslLanguageMetaData } from 'api-2-ai-dsl-language';
import { Command } from 'commander';
import { generateAction } from './generate-command.js';

declare const __API2AI_CLI_BUNDLE_VERSION__: string;

async function main(): Promise<void> {
    const program = new Command();
    program.name('api2ai').version(__API2AI_CLI_BUNDLE_VERSION__);
    const fileExtensions = Api2AiDslLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .argument('<destination>', 'destination file')
        .description('Generates code for a provided source file.')
        .action(generateAction);
    await program.parseAsync(process.argv);
}

main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
});
