/**
 * Generated from: spaceflight-news.api2ai
 * Referenced OpenAPI: ./openapi/spaceflight-news.openapi.yaml
 */

export const insecureTls = false;

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
    /** When true, no auth header or fromJwt binding (e.g. login). */
    public?: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        "toolName": "listSpaceflightArticles",
        "title": "List spaceflight articles (teaser only; full text at response url)",
        "description": "Intent:\nlist recent spaceflight news articles; API returns summary teaser only, full article text at each result url\n\nMeta:\ntags: articles | operationId: articles_list\n\nExample:\nGet the latest 5 articles\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results",
        "method": "GET",
        "path": "/v4/articles/",
        "example": "Get the latest 5 articles",
        "public": false
    },
    {
        "toolName": "getSpaceflightArticleById",
        "title": "Get article by ID (teaser only; full text at response url)",
        "description": "Intent:\nget one spaceflight article by id; API returns summary teaser only, full article text at url\n\nMeta:\ntags: articles | operationId: articles_retrieve\n\nExample:\nGet article with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url",
        "method": "GET",
        "path": "/v4/articles/{id}/",
        "example": "Get article with id 1",
        "public": false
    },
    {
        "toolName": "listSpaceflightBlogs",
        "title": "List spaceflight blog posts (teaser only; full text at response url)",
        "description": "Intent:\nlist recent spaceflight blog posts; API returns summary teaser only, full post text at each result url\n\nMeta:\ntags: blogs | operationId: blogs_list\n\nExample:\nGet the latest 5 blog posts\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results",
        "method": "GET",
        "path": "/v4/blogs/",
        "example": "Get the latest 5 blog posts",
        "public": false
    },
    {
        "toolName": "getSpaceflightBlogById",
        "title": "Get blog post by ID (teaser only; full text at response url)",
        "description": "Intent:\nget one spaceflight blog post by id; API returns summary teaser only, full post text at url\n\nMeta:\ntags: blogs | operationId: blogs_retrieve\n\nExample:\nGet blog post with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url",
        "method": "GET",
        "path": "/v4/blogs/{id}/",
        "example": "Get blog post with id 1",
        "public": false
    },
    {
        "toolName": "listSpaceflightReports",
        "title": "List spaceflight reports (teaser only; full text at response url)",
        "description": "Intent:\nlist recent spaceflight reports; API returns summary teaser only, full report text at each result url\n\nMeta:\ntags: reports | operationId: reports_list\n\nExample:\nGet the latest 5 reports\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results",
        "method": "GET",
        "path": "/v4/reports/",
        "example": "Get the latest 5 reports",
        "public": false
    },
    {
        "toolName": "getSpaceflightReportById",
        "title": "Get report by ID (teaser only; full text at response url)",
        "description": "Intent:\nget one spaceflight report by id; API returns summary teaser only, full report text at url\n\nMeta:\ntags: reports | operationId: reports_retrieve\n\nExample:\nGet report with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, id, image_url, news_site, published_at, summary, title, updated_at, url",
        "method": "GET",
        "path": "/v4/reports/{id}/",
        "example": "Get report with id 1",
        "public": false
    },
    {
        "toolName": "getSpaceflightInfo",
        "title": "Spaceflight News API metadata",
        "description": "Intent:\nretrieve spaceflight API metadata and news sites\n\nMeta:\ntags: info | operationId: info_retrieve\n\nExample:\nShow API info and available news sites\n\nResponse:\nHTTP 200\nproperties (top-level): news_sites, version",
        "method": "GET",
        "path": "/v4/info/",
        "example": "Show API info and available news sites",
        "public": false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (not visible to the agent: host base URL, credential, JWT via resolveHostContext). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
    fromJwt?: string;
};

export const requiresAuth = false;
export const authConfig: AuthConfig | undefined = undefined;

export const mcpServerName = "spaceflight-news-tools";
export const mcpServerVersion = "0.0.1";

import * as z from 'zod/v4';

const __api2aiPrimitiveUnion = z.union([z.string(), z.number(), z.boolean()]);
const __api2aiQueryValueUnion = z.union([__api2aiPrimitiveUnion, z.array(__api2aiPrimitiveUnion)]);

export const inputZodByTool = {
    "listSpaceflightArticles": z.object({ "pathParams": z.record(z.string(), __api2aiPrimitiveUnion).describe("No path parameters.").optional(), "query": z.object({ "event": z.array(z.number()).describe("Search for all documents related to a specific event using its Launch Library 2 ID.").optional(), "has_event": z.boolean().describe("Get all documents that have a related event.").optional(), "has_launch": z.boolean().describe("Get all documents that have a related launch.").optional(), "is_featured": z.boolean().describe("Get all documents that are featured.").optional(), "launch": z.array(z.string()).describe("Search for all documents related to a specific launch using its Launch Library 2 ID.").optional(), "limit": z.number().describe("Number of results to return per page.").optional(), "news_site": z.string().describe("Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.").optional(), "news_site_exclude": z.string().describe("Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.").optional(), "offset": z.number().describe("The initial index from which to return the results.").optional(), "ordering": z.array(z.union([z.literal("-published_at"), z.literal("-updated_at"), z.literal("published_at"), z.literal("updated_at")])).describe("Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)").optional(), "published_at_gt": z.string().describe("Get all documents published after a given ISO8601 timestamp (excluded).").optional(), "published_at_gte": z.string().describe("Get all documents published after a given ISO8601 timestamp (included).").optional(), "published_at_lt": z.string().describe("Get all documents published before a given ISO8601 timestamp (excluded).").optional(), "published_at_lte": z.string().describe("Get all documents published before a given ISO8601 timestamp (included).").optional(), "search": z.string().describe("Search for documents with a specific phrase in the title or summary.").optional(), "summary_contains": z.string().describe("Search for all documents with a specific phrase in the summary.").optional(), "summary_contains_all": z.string().describe("Search for documents with a summary containing all keywords from comma-separated values.").optional(), "summary_contains_one": z.string().describe("Search for documents with a summary containing at least one keyword from comma-separated values.").optional(), "title_contains": z.string().describe("Search for all documents with a specific phrase in the title.").optional(), "title_contains_all": z.string().describe("Search for documents with a title containing all keywords from comma-separated values.").optional(), "title_contains_one": z.string().describe("Search for documents with a title containing at least one keyword from comma-separated values.").optional(), "updated_at_gt": z.string().describe("Get all documents updated after a given ISO8601 timestamp (excluded).").optional(), "updated_at_gte": z.string().describe("Get all documents updated after a given ISO8601 timestamp (included).").optional(), "updated_at_lt": z.string().describe("Get all documents updated before a given ISO8601 timestamp (excluded).").optional(), "updated_at_lte": z.string().describe("Get all documents updated before a given ISO8601 timestamp (included).").optional() }).strict().describe("Query parameters from OpenAPI.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "getSpaceflightArticleById": z.object({ "pathParams": z.object({ "id": z.number().describe("A unique integer value identifying this article.") }).strict().describe("Path parameters from OpenAPI."), "query": z.record(z.string(), __api2aiPrimitiveUnion).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "listSpaceflightBlogs": z.object({ "pathParams": z.record(z.string(), __api2aiPrimitiveUnion).describe("No path parameters.").optional(), "query": z.object({ "event": z.array(z.number()).describe("Search for all documents related to a specific event using its Launch Library 2 ID.").optional(), "has_event": z.boolean().describe("Get all documents that have a related event.").optional(), "has_launch": z.boolean().describe("Get all documents that have a related launch.").optional(), "is_featured": z.boolean().describe("Get all documents that are featured.").optional(), "launch": z.array(z.string()).describe("Search for all documents related to a specific launch using its Launch Library 2 ID.").optional(), "limit": z.number().describe("Number of results to return per page.").optional(), "news_site": z.string().describe("Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.").optional(), "news_site_exclude": z.string().describe("Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.").optional(), "offset": z.number().describe("The initial index from which to return the results.").optional(), "ordering": z.array(z.union([z.literal("-published_at"), z.literal("-updated_at"), z.literal("published_at"), z.literal("updated_at")])).describe("Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)").optional(), "published_at_gt": z.string().describe("Get all documents published after a given ISO8601 timestamp (excluded).").optional(), "published_at_gte": z.string().describe("Get all documents published after a given ISO8601 timestamp (included).").optional(), "published_at_lt": z.string().describe("Get all documents published before a given ISO8601 timestamp (excluded).").optional(), "published_at_lte": z.string().describe("Get all documents published before a given ISO8601 timestamp (included).").optional(), "search": z.string().describe("Search for documents with a specific phrase in the title or summary.").optional(), "summary_contains": z.string().describe("Search for all documents with a specific phrase in the summary.").optional(), "summary_contains_all": z.string().describe("Search for documents with a summary containing all keywords from comma-separated values.").optional(), "summary_contains_one": z.string().describe("Search for documents with a summary containing at least one keyword from comma-separated values.").optional(), "title_contains": z.string().describe("Search for all documents with a specific phrase in the title.").optional(), "title_contains_all": z.string().describe("Search for documents with a title containing all keywords from comma-separated values.").optional(), "title_contains_one": z.string().describe("Search for documents with a title containing at least one keyword from comma-separated values.").optional(), "updated_at_gt": z.string().describe("Get all documents updated after a given ISO8601 timestamp (excluded).").optional(), "updated_at_gte": z.string().describe("Get all documents updated after a given ISO8601 timestamp (included).").optional(), "updated_at_lt": z.string().describe("Get all documents updated before a given ISO8601 timestamp (excluded).").optional(), "updated_at_lte": z.string().describe("Get all documents updated before a given ISO8601 timestamp (included).").optional() }).strict().describe("Query parameters from OpenAPI.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "getSpaceflightBlogById": z.object({ "pathParams": z.object({ "id": z.number().describe("A unique integer value identifying this blog.") }).strict().describe("Path parameters from OpenAPI."), "query": z.record(z.string(), __api2aiPrimitiveUnion).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "listSpaceflightReports": z.object({ "pathParams": z.record(z.string(), __api2aiPrimitiveUnion).describe("No path parameters.").optional(), "query": z.object({ "limit": z.number().describe("Number of results to return per page.").optional(), "news_site": z.string().describe("Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.").optional(), "news_site_exclude": z.string().describe("Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.").optional(), "offset": z.number().describe("The initial index from which to return the results.").optional(), "ordering": z.array(z.union([z.literal("-published_at"), z.literal("-updated_at"), z.literal("published_at"), z.literal("updated_at")])).describe("Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)").optional(), "published_at_gt": z.string().describe("Get all documents published after a given ISO8601 timestamp (excluded).").optional(), "published_at_gte": z.string().describe("Get all documents published after a given ISO8601 timestamp (included).").optional(), "published_at_lt": z.string().describe("Get all documents published before a given ISO8601 timestamp (excluded).").optional(), "published_at_lte": z.string().describe("Get all documents published before a given ISO8601 timestamp (included).").optional(), "search": z.string().describe("Search for documents with a specific phrase in the title or summary.").optional(), "summary_contains": z.string().describe("Search for all documents with a specific phrase in the summary.").optional(), "summary_contains_all": z.string().describe("Search for documents with a summary containing all keywords from comma-separated values.").optional(), "summary_contains_one": z.string().describe("Search for documents with a summary containing at least one keyword from comma-separated values.").optional(), "title_contains": z.string().describe("Search for all documents with a specific phrase in the title.").optional(), "title_contains_all": z.string().describe("Search for documents with a title containing all keywords from comma-separated values.").optional(), "title_contains_one": z.string().describe("Search for documents with a title containing at least one keyword from comma-separated values.").optional(), "updated_at_gt": z.string().describe("Get all documents updated after a given ISO8601 timestamp (excluded).").optional(), "updated_at_gte": z.string().describe("Get all documents updated after a given ISO8601 timestamp (included).").optional(), "updated_at_lt": z.string().describe("Get all documents updated before a given ISO8601 timestamp (excluded).").optional(), "updated_at_lte": z.string().describe("Get all documents updated before a given ISO8601 timestamp (included).").optional() }).strict().describe("Query parameters from OpenAPI.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "getSpaceflightReportById": z.object({ "pathParams": z.object({ "id": z.number().describe("A unique integer value identifying this report.") }).strict().describe("Path parameters from OpenAPI."), "query": z.record(z.string(), __api2aiPrimitiveUnion).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "getSpaceflightInfo": z.object({ "pathParams": z.record(z.string(), __api2aiPrimitiveUnion).describe("No path parameters.").optional(), "query": z.record(z.string(), __api2aiPrimitiveUnion).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __api2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper.")
};

export const MCP_HOST_BASE_URL_ENV_KEY = 'API2AI_MCP_BASE_URL_ENV_KEY';
export const MCP_HOST_AUTH_ENV_KEY = 'API2AI_MCP_AUTH_ENV_KEY';

function decodeJwtPayloadUnsafe(token) {
    const parts = String(token).trim().split('.');
    if (parts.length !== 3) {
        throw new Error('credential is not a JWT (expected three dot-separated segments).');
    }
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

/** Host session (base URL, credential, decoded JWT). Re-reads env on every call — dev only, no signature verify. */
export function resolveHostContext() {
    const baseUrlKey = process.env[MCP_HOST_BASE_URL_ENV_KEY]?.trim();
    const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
    if (!baseUrl) {
        throw new Error(
            'Missing host base URL. Pass --base-url-env on mcp-serve.mjs and set the variable (or use smoke-generated).'
        );
    }

    const authKey = process.env[MCP_HOST_AUTH_ENV_KEY]?.trim();
    let credential = authKey ? process.env[authKey]?.trim() : undefined;
    credential = credential || undefined;

    let jwt;
    if (credential) {
        const segments = String(credential).trim().split('.');
        if (segments.length === 3) {
            try {
                jwt = decodeJwtPayloadUnsafe(credential);
            } catch {
                jwt = undefined;
            }
        }
    }

    return { baseUrl, credential, jwt };
}

export const queryParamSerializationByTool = {
    "listSpaceflightArticles": {
        "event": {
            "style": "form",
            "explode": false
        },
        "has_event": {
            "style": "form",
            "explode": true
        },
        "has_launch": {
            "style": "form",
            "explode": true
        },
        "is_featured": {
            "style": "form",
            "explode": true
        },
        "launch": {
            "style": "form",
            "explode": false
        },
        "limit": {
            "style": "form",
            "explode": true
        },
        "news_site": {
            "style": "form",
            "explode": true
        },
        "news_site_exclude": {
            "style": "form",
            "explode": true
        },
        "offset": {
            "style": "form",
            "explode": true
        },
        "ordering": {
            "style": "form",
            "explode": false
        },
        "published_at_gt": {
            "style": "form",
            "explode": true
        },
        "published_at_gte": {
            "style": "form",
            "explode": true
        },
        "published_at_lt": {
            "style": "form",
            "explode": true
        },
        "published_at_lte": {
            "style": "form",
            "explode": true
        },
        "search": {
            "style": "form",
            "explode": true
        },
        "summary_contains": {
            "style": "form",
            "explode": true
        },
        "summary_contains_all": {
            "style": "form",
            "explode": true
        },
        "summary_contains_one": {
            "style": "form",
            "explode": true
        },
        "title_contains": {
            "style": "form",
            "explode": true
        },
        "title_contains_all": {
            "style": "form",
            "explode": true
        },
        "title_contains_one": {
            "style": "form",
            "explode": true
        },
        "updated_at_gt": {
            "style": "form",
            "explode": true
        },
        "updated_at_gte": {
            "style": "form",
            "explode": true
        },
        "updated_at_lt": {
            "style": "form",
            "explode": true
        },
        "updated_at_lte": {
            "style": "form",
            "explode": true
        }
    },
    "getSpaceflightArticleById": {},
    "listSpaceflightBlogs": {
        "event": {
            "style": "form",
            "explode": false
        },
        "has_event": {
            "style": "form",
            "explode": true
        },
        "has_launch": {
            "style": "form",
            "explode": true
        },
        "is_featured": {
            "style": "form",
            "explode": true
        },
        "launch": {
            "style": "form",
            "explode": false
        },
        "limit": {
            "style": "form",
            "explode": true
        },
        "news_site": {
            "style": "form",
            "explode": true
        },
        "news_site_exclude": {
            "style": "form",
            "explode": true
        },
        "offset": {
            "style": "form",
            "explode": true
        },
        "ordering": {
            "style": "form",
            "explode": false
        },
        "published_at_gt": {
            "style": "form",
            "explode": true
        },
        "published_at_gte": {
            "style": "form",
            "explode": true
        },
        "published_at_lt": {
            "style": "form",
            "explode": true
        },
        "published_at_lte": {
            "style": "form",
            "explode": true
        },
        "search": {
            "style": "form",
            "explode": true
        },
        "summary_contains": {
            "style": "form",
            "explode": true
        },
        "summary_contains_all": {
            "style": "form",
            "explode": true
        },
        "summary_contains_one": {
            "style": "form",
            "explode": true
        },
        "title_contains": {
            "style": "form",
            "explode": true
        },
        "title_contains_all": {
            "style": "form",
            "explode": true
        },
        "title_contains_one": {
            "style": "form",
            "explode": true
        },
        "updated_at_gt": {
            "style": "form",
            "explode": true
        },
        "updated_at_gte": {
            "style": "form",
            "explode": true
        },
        "updated_at_lt": {
            "style": "form",
            "explode": true
        },
        "updated_at_lte": {
            "style": "form",
            "explode": true
        }
    },
    "getSpaceflightBlogById": {},
    "listSpaceflightReports": {
        "limit": {
            "style": "form",
            "explode": true
        },
        "news_site": {
            "style": "form",
            "explode": true
        },
        "news_site_exclude": {
            "style": "form",
            "explode": true
        },
        "offset": {
            "style": "form",
            "explode": true
        },
        "ordering": {
            "style": "form",
            "explode": false
        },
        "published_at_gt": {
            "style": "form",
            "explode": true
        },
        "published_at_gte": {
            "style": "form",
            "explode": true
        },
        "published_at_lt": {
            "style": "form",
            "explode": true
        },
        "published_at_lte": {
            "style": "form",
            "explode": true
        },
        "search": {
            "style": "form",
            "explode": true
        },
        "summary_contains": {
            "style": "form",
            "explode": true
        },
        "summary_contains_all": {
            "style": "form",
            "explode": true
        },
        "summary_contains_one": {
            "style": "form",
            "explode": true
        },
        "title_contains": {
            "style": "form",
            "explode": true
        },
        "title_contains_all": {
            "style": "form",
            "explode": true
        },
        "title_contains_one": {
            "style": "form",
            "explode": true
        },
        "updated_at_gt": {
            "style": "form",
            "explode": true
        },
        "updated_at_gte": {
            "style": "form",
            "explode": true
        },
        "updated_at_lt": {
            "style": "form",
            "explode": true
        },
        "updated_at_lte": {
            "style": "form",
            "explode": true
        }
    },
    "getSpaceflightReportById": {},
    "getSpaceflightInfo": {}
};

function appendSerializedQueryParams(searchParams, toolName, query) {
    if (!query) {
        return;
    }
    const hintsByParam = queryParamSerializationByTool[toolName] ?? {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            const hint = hintsByParam[key];
            const style = hint && hint.style ? hint.style : 'form';
            const explode = hint && typeof hint.explode === 'boolean' ? hint.explode : true;
            if (style !== 'form') {
                throw new Error(
                    'invokeTool: query array param "' +
                        key +
                        '" uses OpenAPI style "' +
                        style +
                        '"; only style "form" is supported for arrays.'
                );
            }
            const parts = [];
            for (const element of value) {
                if (element === undefined || element === null) {
                    continue;
                }
                parts.push(String(element));
            }
            if (parts.length === 0) {
                continue;
            }
            if (explode) {
                for (const p of parts) {
                    searchParams.append(key, p);
                }
            } else {
                searchParams.set(key, parts.join(','));
            }
            continue;
        }
        searchParams.set(key, String(value));
    }
}


export async function invokeTool(toolName, options = {}, hostContext) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const host = hostContext ?? resolveHostContext();
    const { baseUrl, credential, jwt } = host;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = !tool.public && authConfig?.fromJwt
        ? resolvePathParamsWithFromJwt(authConfig, options.pathParams, jwt)
        : { ...(options.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, options.query);
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };

    if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            bodySnippet = '';
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            if (authConfig && !tool.public) {
                
            } else if (!tool.public) {
                msg += ' The API may require authentication.';
            }
        } else if (response.status === 403) {
            msg += ' Forbidden: insufficient permission for this request.';
        } else if (response.status === 429) {
            msg += ' Too Many Requests (rate limited).';
            if (retryAfter) {
                msg += ' Retry-After: ' + retryAfter + ' (seconds or HTTP-date per server).';
            } else {
                msg += ' Wait before retrying.';
            }
        }
        if (bodySnippet) {
            msg += ' Response body: ' + bodySnippet;
        }
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
