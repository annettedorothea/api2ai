import type { Model } from 'api-2-ai-dsl-language';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';
import { getOperations, invokeOperation, type InvokeArgs } from './runtime.js';

export async function runMcpServer(model: Model, baseUrl: string): Promise<void> {
    const server = new McpServer({
        name: 'api2ai-generated-tools',
        version: '0.1.0'
    });

    for (const operation of getOperations(model)) {
        server.registerTool(
            operation.toolName,
            {
                description: operation.example
                    ? `${operation.intent} Example: ${operation.example}`
                    : operation.intent,
                inputSchema: {
                    pathParams: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
                    query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
                    headers: z.record(z.string(), z.string()).optional(),
                    body: z.unknown().optional()
                }
            },
            async (args) => {
                const invokeArgs: InvokeArgs = {
                    pathParams: args.pathParams,
                    query: args.query,
                    headers: args.headers,
                    body: args.body
                };
                const result = await invokeOperation(baseUrl, operation, invokeArgs);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
        );
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
}
