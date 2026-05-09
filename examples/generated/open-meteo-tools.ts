/**
 * Generated from: open-meteo.api2ai
 * Referenced OpenAPI: ./openapi/open-meteo.openapi.yaml
 */

export const baseUrl = "https://api.open-meteo.com";

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
        "path": "/v1/forecast",
        "toolName": "openMeteoForecast",
        "intent": "retrieve hourly weather forecast for coordinates",
        "example": "Get hourly temperature forecast for Offenburg, Germany"
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
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    body?: unknown;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    env: string;
    prefix?: string;
};

const authConfig: AuthConfig | undefined = undefined;

const defaultInputSchema = {
    pathParams: { type: 'object', additionalProperties: true },
    query: { type: 'object', additionalProperties: true },
    headers: { type: 'object', additionalProperties: true },
    body: {}
};

export const inputSchemaByTool = Object.fromEntries(generatedTools.map((tool) => [tool.toolName, defaultInputSchema]));

function resolveAuthValue(auth) {
    const secret = process.env[auth.env];
    if (!secret) {
        throw new Error('Missing required environment variable ' + auth.env + ' for API auth.');
    }
    return (auth.prefix ?? '') + secret;
}

export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find(t => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const effectiveBaseUrl = options.baseUrl ?? baseUrl;
    const normalizedBaseUrl = effectiveBaseUrl.endsWith('/') ? effectiveBaseUrl.slice(0, -1) : effectiveBaseUrl;
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(options.pathParams ?? {})) {
        resolvedPath = resolvedPath.split('{'+ key +'}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    if (options.query) {
        for (const [key, value] of Object.entries(options.query)) {
            if (value === undefined || value === null) {
                continue;
            }
            url.searchParams.set(key, String(value));
        }
    }
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };
    if (authConfig) {
        const authValue = resolveAuthValue(authConfig);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
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
