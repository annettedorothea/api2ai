/**
 * Generated from: spaceflight-news.api2ai
 * Referenced OpenAPI: ./openapi/spaceflight-news.openapi.yaml
 */

export const baseUrl = "https://api.spaceflightnewsapi.net";

const rawTools = [
    {
        "method": "GET",
        "path": "/v4/articles/",
        "toolName": "listSpaceflightArticles",
        "intent": "list recent spaceflight news articles",
        "example": "Get the latest 5 articles"
    },
    {
        "method": "GET",
        "path": "/v4/articles/{id}/",
        "toolName": "getSpaceflightArticleById",
        "intent": "get one spaceflight article by id",
        "example": "Get article with id 1"
    },
    {
        "method": "GET",
        "path": "/v4/blogs/",
        "toolName": "listSpaceflightBlogs",
        "intent": "list recent spaceflight blog posts",
        "example": "Get the latest 5 blog posts"
    },
    {
        "method": "GET",
        "path": "/v4/blogs/{id}/",
        "toolName": "getSpaceflightBlogById",
        "intent": "get one spaceflight blog post by id",
        "example": "Get blog post with id 1"
    },
    {
        "method": "GET",
        "path": "/v4/reports/",
        "toolName": "listSpaceflightReports",
        "intent": "list recent spaceflight reports",
        "example": "Get the latest 5 reports"
    },
    {
        "method": "GET",
        "path": "/v4/reports/{id}/",
        "toolName": "getSpaceflightReportById",
        "intent": "get one spaceflight report by id",
        "example": "Get report with id 1"
    },
    {
        "method": "GET",
        "path": "/v4/info/",
        "toolName": "getSpaceflightInfo",
        "intent": "retrieve spaceflight API metadata and news sites",
        "example": "Show API info and available news sites"
    }
];

export const generatedTools = rawTools.map((tool) => ({
    toolName: tool.toolName,
    description: tool.example ? tool.intent + ' Example: ' + tool.example : tool.intent,
    method: tool.method,
    path: tool.path,
    example: tool.example
}));

const authConfig = undefined;

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
