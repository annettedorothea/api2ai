/**
 * Generated from: ./examples/petstore.api2ai
 * Referenced OpenAPI: ./petstore.openapi.yaml
 */

export const baseUrl = "https://petstore3.swagger.io/api/v3";

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

const rawTools: ToolDefinition[] = [
    {
        "method": "GET",
        "path": "/pet/findByStatus",
        "toolName": "findPetsByStatus",
        "intent": "find pets by their status",
        "example": "Find all available pets"
    },
    {
        "method": "GET",
        "path": "/pet/{petId}",
        "toolName": "getPetById",
        "intent": "get one pet by id",
        "example": "Get pet with id 42"
    },
    {
        "method": "POST",
        "path": "/pet",
        "toolName": "upsertPet",
        "intent": "create or update a pet",
        "example": "Create a pet with name Buddy"
    }
];

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
