import { isModel } from 'api-2-ai-dsl-language';
import { createApi2AiDslServices } from 'api-2-ai-dsl-language';
import { assertDocumentValidForGenerate } from '@core2ai/core/codegen';
import chalk from 'chalk';
import * as path from 'node:path';
import { NodeFileSystem } from 'langium/node';
import { generateOutput } from './generator.js';

export async function generateAction(source: string, destination: string): Promise<void> {
    const services = createApi2AiDslServices(NodeFileSystem).Api2AiDsl;
    const document = await assertDocumentValidForGenerate(source, services);
    const model = document.parseResult?.value;
    if (!isModel(model)) {
        console.error(chalk.red(`Cannot generate: ${path.basename(source)} is not a valid api2ai model.`));
        process.exit(1);
    }
    const generatedFiles = await generateOutput(model, source, destination);
    console.log(chalk.green(`Code generated successfully:`));
    console.log(chalk.green(`- TS: ${generatedFiles.tsPath}`));
    console.log(chalk.green(`- JS: ${generatedFiles.jsPath}`));
    console.log(chalk.green(`- MCP host: ${generatedFiles.mcpServePath}`));
}
