import type { Model } from 'api-2-ai-dsl-language';
import chalk from 'chalk';
import * as fs from 'node:fs';
import { invokeOperation, getOperations, type InvokeArgs } from './runtime.js';

export async function runSmokeTest(model: Model, baseUrl: string, toolName: string, argsJson?: string): Promise<void> {
    const operation = getOperations(model).find(item => item.toolName === toolName);
    if (!operation) {
        const available = getOperations(model).map(item => item.toolName).join(', ');
        console.error(chalk.red(`Tool "${toolName}" not found. Available tools: ${available}`));
        process.exit(1);
    }

    let args: InvokeArgs = {};
    if (argsJson) {
        try {
            const argsContent = argsJson.startsWith('@')
                ? fs.readFileSync(argsJson.slice(1), 'utf-8')
                : argsJson;
            args = JSON.parse(argsContent) as InvokeArgs;
        } catch (error) {
            console.error(chalk.red(`Invalid args JSON: ${error instanceof Error ? error.message : String(error)}`));
            process.exit(1);
        }
    }

    const result = await invokeOperation(baseUrl, operation, args);
    console.log(chalk.green(`Smoke test passed for "${operation.toolName}".`));
    console.log(JSON.stringify(result, null, 2));
}
