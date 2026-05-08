import type { Model } from 'api-2-ai-dsl-language';
import { expandToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import { extractDestinationAndName } from './util.js';

export function generateOutput(model: Model, source: string, destination: string): string {
    const data = extractDestinationAndName(destination);
    const operations = model.operations.map(operation => ({
        method: operation.method,
        path: operation.path,
        toolName: operation.toolName,
        intent: operation.intent,
        example: operation.example
    }));
    const toolsArrayLiteral = JSON.stringify(operations, null, 4);

    const fileNode = expandToNode`
        /**
         * Generated from: ${source}
         * Referenced OpenAPI: ${model.openapi}
         */

        export const baseUrl = ${JSON.stringify(model.baseUrl)};

        export type GeneratedTool = {
            toolName: string;
            description: string;
            method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
            path: string;
            example?: string;
        };

        type ToolDefinition = {
            method: GeneratedTool['method'];
            path: string;
            toolName: string;
            intent: string;
            example?: string;
        };

        const rawTools: ToolDefinition[] = ${toolsArrayLiteral};

        export const generatedTools: GeneratedTool[] = rawTools.map((tool) => ({
            toolName: tool.toolName,
            description: tool.example ? tool.intent + ' Example: ' + tool.example : tool.intent,
            method: tool.method,
            path: tool.path,
            example: tool.example
        }));

        export type InvokeOptions = {
            baseUrl?: string;
            query?: Record<string, string | number | boolean>;
            headers?: Record<string, string>;
            body?: unknown;
        };

        export async function invokeTool(toolName: string, options: InvokeOptions): Promise<unknown> {
            const tool = generatedTools.find(t => t.toolName === toolName);
            if (!tool) {
                throw new Error('Unknown tool: ' + toolName);
            }

            const effectiveBaseUrl = options.baseUrl ?? baseUrl;
            const normalizedBaseUrl = effectiveBaseUrl.endsWith('/') ? effectiveBaseUrl.slice(0, -1) : effectiveBaseUrl;
            const url = new URL(normalizedBaseUrl + tool.path);
            if (options.query) {
                for (const [key, value] of Object.entries(options.query)) {
                    url.searchParams.set(key, String(value));
                }
            }

            const requestInit: RequestInit = {
                method: tool.method,
                headers: {
                    'content-type': 'application/json',
                    ...(options.headers ?? {})
                }
            };

            if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
                requestInit.body = JSON.stringify(options.body);
            }

            const response = await fetch(url, requestInit);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' while invoking ' + tool.toolName);
            }

            const contentType = response.headers.get('content-type') ?? '';
            if (contentType.includes('application/json')) {
                return response.json();
            }
            return response.text();
        }
    `.appendNewLineIfNotEmpty();

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(destination, toString(fileNode));
    return destination;
}
