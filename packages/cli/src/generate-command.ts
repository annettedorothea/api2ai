import type { Model } from 'api-2-ai-dsl-language';
import { createApi2AiDslServices } from 'api-2-ai-dsl-language';
import { extractAstNode } from '@core2ai/core/codegen';
import chalk from 'chalk';
import { generateOutput } from './generator.js';
import { NodeFileSystem } from 'langium/node';

export async function generateAction(source: string, destination: string): Promise<void> {
    const services = createApi2AiDslServices(NodeFileSystem).Api2AiDsl;
    const model = await extractAstNode<Model>(source, services);
    const generatedFiles = await generateOutput(model, source, destination);
    console.log(chalk.green(`Code generated succesfully:`));
    console.log(chalk.green(`- TS: ${generatedFiles.tsPath}`));
    console.log(chalk.green(`- JS: ${generatedFiles.jsPath}`));
    console.log(chalk.green(`- MCP host: ${generatedFiles.mcpServePath}`));
}
