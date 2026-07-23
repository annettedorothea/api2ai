/**
 * Generated from: spaceflight-news.api2ai
 * Referenced OpenAPI: ./openapi/spaceflight-news.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { prepareToolCallForListSpaceflightArticles } from '../../../src/hooks/api2ai/spaceflight-news-tools/prepareToolCallForListSpaceflightArticles.js';
import { prepareToolCallForListSpaceflightBlogs } from '../../../src/hooks/api2ai/spaceflight-news-tools/prepareToolCallForListSpaceflightBlogs.js';
import { prepareToolCallForListSpaceflightReports } from '../../../src/hooks/api2ai/spaceflight-news-tools/prepareToolCallForListSpaceflightReports.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'listSpaceflightArticles',
        title: 'List spaceflight articles (limit validated, teaser only; full text at response url)',
        description:
            'Intent:\n- List recent spaceflight news articles (pagination: limit, offset, ordering).\n        - Query limit caps how many articles are returned (default 10, max 10).\n        - Response contains title, summary teaser, and url per item — not the full article body.\n        - Use search, has_launch, or news_site filters for SpaceX, launches, or specific outlets.\n        - Follow result url only when full text is needed (same pattern for blogs and reports tools).\n\nMCP arguments:\npass event, has_event, has_launch, is_featured, launch, limit, news_site, news_site_exclude, offset, ordering, published_at_gt, published_at_gte, published_at_lt, published_at_lte, search, summary_contains, summary_contains_all, summary_contains_one, title_contains, title_contains_all, title_contains_one, updated_at_gt, updated_at_gte, updated_at_lt, updated_at_lte as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: articles | operationId: articles_list\n\nParameters:\n- event (query): Search for all documents related to a specific event using its Launch Library 2 ID. (type: array of integer)\n- has_event (query): Get all documents that have a related event. (type: boolean)\n- has_launch (query): Get all documents that have a related launch. (type: boolean)\n- is_featured (query): Get all documents that are featured. (type: boolean)\n- launch (query): Search for all documents related to a specific launch using its Launch Library 2 ID. (type: array of string)\n- limit (query): Number of results per page (default 10, max 10). (type: integer) (example: 10)\n- news_site (query): Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive. (type: string)\n- news_site_exclude (query): Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive. (type: string)\n- offset (query): The initial index from which to return the results. (type: integer)\n- ordering (query): Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending) (type: array of string)\n- published_at_gt (query): Get all documents published after a given ISO8601 timestamp (excluded). (type: string)\n- published_at_gte (query): Get all documents published after a given ISO8601 timestamp (included). (type: string)\n- published_at_lt (query): Get all documents published before a given ISO8601 timestamp (excluded). (type: string)\n- published_at_lte (query): Get all documents published before a given ISO8601 timestamp (included). (type: string)\n- search (query): Search for documents with a specific phrase in the title or summary. (type: string)\n- summary_contains (query): Search for all documents with a specific phrase in the summary. (type: string)\n- summary_contains_all (query): Search for documents with a summary containing all keywords from comma-separated values. (type: string)\n- summary_contains_one (query): Search for documents with a summary containing at least one keyword from comma-separated values. (type: string)\n- title_contains (query): Search for all documents with a specific phrase in the title. (type: string)\n- title_contains_all (query): Search for documents with a title containing all keywords from comma-separated values. (type: string)\n- title_contains_one (query): Search for documents with a title containing at least one keyword from comma-separated values. (type: string)\n- updated_at_gt (query): Get all documents updated after a given ISO8601 timestamp (excluded). (type: string)\n- updated_at_gte (query): Get all documents updated after a given ISO8601 timestamp (included). (type: string)\n- updated_at_lt (query): Get all documents updated before a given ISO8601 timestamp (excluded). (type: string)\n- updated_at_lte (query): Get all documents updated before a given ISO8601 timestamp (included). (type: string)\n\nExample:\nGet the latest 5 articles\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results\n\nRuntime: implement prepareToolCallForListSpaceflightArticles in src/hooks/api2ai/spaceflight-news-tools/prepareToolCallForListSpaceflightArticles.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/v4/articles/',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: true
    },
    {
        toolName: 'getSpaceflightArticleById',
        title: 'Get article by ID (teaser only; full text at response url)',
        description:
            'Intent:\nget one spaceflight article by id; API returns summary teaser only, full article text at url\n\nMCP arguments:\npass id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: articles | operationId: articles_retrieve\n\nParameters:\n- id (path): A unique integer value identifying this article. (type: integer)\n\nExample:\nGet article with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/articles/{id}/',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'listSpaceflightBlogs',
        title: 'List spaceflight blog posts (limit validated, teaser only; full text at response url)',
        description:
            'Intent:\n- List recent spaceflight blog posts (pagination: limit, offset, ordering).\n        - Query limit caps how many blog posts are returned (default 10, max 10).\n        - Response contains title, summary teaser, and url per item — not the full post body.\n        - Use search, has_launch, or news_site filters for SpaceX, launches, or specific outlets.\n        - Follow result url only when full text is needed (same pattern for articles and reports tools).\n\nMCP arguments:\npass event, has_event, has_launch, is_featured, launch, limit, news_site, news_site_exclude, offset, ordering, published_at_gt, published_at_gte, published_at_lt, published_at_lte, search, summary_contains, summary_contains_all, summary_contains_one, title_contains, title_contains_all, title_contains_one, updated_at_gt, updated_at_gte, updated_at_lt, updated_at_lte as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: blogs | operationId: blogs_list\n\nParameters:\n- event (query): Search for all documents related to a specific event using its Launch Library 2 ID. (type: array of integer)\n- has_event (query): Get all documents that have a related event. (type: boolean)\n- has_launch (query): Get all documents that have a related launch. (type: boolean)\n- is_featured (query): Get all documents that are featured. (type: boolean)\n- launch (query): Search for all documents related to a specific launch using its Launch Library 2 ID. (type: array of string)\n- limit (query): Number of results per page (default 10, max 10). (type: integer) (example: 10)\n- news_site (query): Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive. (type: string)\n- news_site_exclude (query): Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive. (type: string)\n- offset (query): The initial index from which to return the results. (type: integer)\n- ordering (query): Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending) (type: array of string)\n- published_at_gt (query): Get all documents published after a given ISO8601 timestamp (excluded). (type: string)\n- published_at_gte (query): Get all documents published after a given ISO8601 timestamp (included). (type: string)\n- published_at_lt (query): Get all documents published before a given ISO8601 timestamp (excluded). (type: string)\n- published_at_lte (query): Get all documents published before a given ISO8601 timestamp (included). (type: string)\n- search (query): Search for documents with a specific phrase in the title or summary. (type: string)\n- summary_contains (query): Search for all documents with a specific phrase in the summary. (type: string)\n- summary_contains_all (query): Search for documents with a summary containing all keywords from comma-separated values. (type: string)\n- summary_contains_one (query): Search for documents with a summary containing at least one keyword from comma-separated values. (type: string)\n- title_contains (query): Search for all documents with a specific phrase in the title. (type: string)\n- title_contains_all (query): Search for documents with a title containing all keywords from comma-separated values. (type: string)\n- title_contains_one (query): Search for documents with a title containing at least one keyword from comma-separated values. (type: string)\n- updated_at_gt (query): Get all documents updated after a given ISO8601 timestamp (excluded). (type: string)\n- updated_at_gte (query): Get all documents updated after a given ISO8601 timestamp (included). (type: string)\n- updated_at_lt (query): Get all documents updated before a given ISO8601 timestamp (excluded). (type: string)\n- updated_at_lte (query): Get all documents updated before a given ISO8601 timestamp (included). (type: string)\n\nExample:\nGet the latest 5 blog posts\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results\n\nRuntime: implement prepareToolCallForListSpaceflightBlogs in src/hooks/api2ai/spaceflight-news-tools/prepareToolCallForListSpaceflightBlogs.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/v4/blogs/',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: true
    },
    {
        toolName: 'getSpaceflightBlogById',
        title: 'Get blog post by ID (teaser only; full text at response url)',
        description:
            'Intent:\nget one spaceflight blog post by id; API returns summary teaser only, full post text at url\n\nMCP arguments:\npass id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: blogs | operationId: blogs_retrieve\n\nParameters:\n- id (path): A unique integer value identifying this blog. (type: integer)\n\nExample:\nGet blog post with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/blogs/{id}/',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'listSpaceflightReports',
        title: 'List spaceflight reports (limit validated, teaser only; full text at response url)',
        description:
            'Intent:\n- List recent spaceflight reports (pagination: limit, offset, ordering).\n        - Query limit caps how many reports are returned (default 10, max 10).\n        - Response contains title, summary teaser, and url per item — not the full report body.\n        - Use search or news_site filters for specific outlets or topics.\n        - Follow result url only when full text is needed (same pattern for articles and blogs tools).\n\nMCP arguments:\npass limit, news_site, news_site_exclude, offset, ordering, published_at_gt, published_at_gte, published_at_lt, published_at_lte, search, summary_contains, summary_contains_all, summary_contains_one, title_contains, title_contains_all, title_contains_one, updated_at_gt, updated_at_gte, updated_at_lt, updated_at_lte as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: reports | operationId: reports_list\n\nParameters:\n- limit (query): Number of results per page (default 10, max 10). (type: integer) (example: 10)\n- news_site (query): Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive. (type: string)\n- news_site_exclude (query): Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive. (type: string)\n- offset (query): The initial index from which to return the results. (type: integer)\n- ordering (query): Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending) (type: array of string)\n- published_at_gt (query): Get all documents published after a given ISO8601 timestamp (excluded). (type: string)\n- published_at_gte (query): Get all documents published after a given ISO8601 timestamp (included). (type: string)\n- published_at_lt (query): Get all documents published before a given ISO8601 timestamp (excluded). (type: string)\n- published_at_lte (query): Get all documents published before a given ISO8601 timestamp (included). (type: string)\n- search (query): Search for documents with a specific phrase in the title or summary. (type: string)\n- summary_contains (query): Search for all documents with a specific phrase in the summary. (type: string)\n- summary_contains_all (query): Search for documents with a summary containing all keywords from comma-separated values. (type: string)\n- summary_contains_one (query): Search for documents with a summary containing at least one keyword from comma-separated values. (type: string)\n- title_contains (query): Search for all documents with a specific phrase in the title. (type: string)\n- title_contains_all (query): Search for documents with a title containing all keywords from comma-separated values. (type: string)\n- title_contains_one (query): Search for documents with a title containing at least one keyword from comma-separated values. (type: string)\n- updated_at_gt (query): Get all documents updated after a given ISO8601 timestamp (excluded). (type: string)\n- updated_at_gte (query): Get all documents updated after a given ISO8601 timestamp (included). (type: string)\n- updated_at_lt (query): Get all documents updated before a given ISO8601 timestamp (excluded). (type: string)\n- updated_at_lte (query): Get all documents updated before a given ISO8601 timestamp (included). (type: string)\n\nExample:\nGet the latest 5 reports\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results\n\nRuntime: implement prepareToolCallForListSpaceflightReports in src/hooks/api2ai/spaceflight-news-tools/prepareToolCallForListSpaceflightReports.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/v4/reports/',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: true
    },
    {
        toolName: 'getSpaceflightReportById',
        title: 'Get report by ID (teaser only; full text at response url)',
        description:
            'Intent:\nget one spaceflight report by id; API returns summary teaser only, full report text at url\n\nMCP arguments:\npass id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: reports | operationId: reports_retrieve\n\nParameters:\n- id (path): A unique integer value identifying this report. (type: integer)\n\nExample:\nGet report with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, id, image_url, news_site, published_at, summary, title, updated_at, url\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/reports/{id}/',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getSpaceflightInfo',
        title: 'Spaceflight News API metadata',
        description:
            'Intent:\nretrieve spaceflight API metadata and news sites\n\nMeta:\ntags: info | operationId: info_retrieve\n\nExample:\nShow API info and available news sites\n\nResponse:\nHTTP 200\nproperties (top-level): news_sites, version\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/info/',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by the MCP host in servers/*). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
};

export const requiresAuth = false;

export const mcpServerName = 'spaceflight-news-tools';
export const mcpServerVersion = '1.0.2';

export { mcpBuildGeneratedAt } from '../mcp-build-generated-at.js';

const prepareToolCallHooks: Record<
    string,
    (options: InvokeOptions, credential?: string) => InvokeOptions | Promise<InvokeOptions>
> = {
    listSpaceflightArticles: prepareToolCallForListSpaceflightArticles,
    listSpaceflightBlogs: prepareToolCallForListSpaceflightBlogs,
    listSpaceflightReports: prepareToolCallForListSpaceflightReports
};

export const inputZodByTool = {
    listSpaceflightArticles: z
        .object({
            event: z
                .union([z.array(z.number().int()), z.string()])
                .describe(
                    'Search for all documents related to a specific event using its Launch Library 2 ID. (type: array of integer)'
                )
                .optional(),
            has_event: z.boolean().describe('Get all documents that have a related event. (type: boolean)').optional(),
            has_launch: z
                .boolean()
                .describe('Get all documents that have a related launch. (type: boolean)')
                .optional(),
            is_featured: z.boolean().describe('Get all documents that are featured. (type: boolean)').optional(),
            launch: z
                .union([z.array(z.string()), z.string()])
                .describe(
                    'Search for all documents related to a specific launch using its Launch Library 2 ID. (type: array of string)'
                )
                .optional(),
            limit: z
                .number()
                .int()
                .describe('Number of results per page (default 10, max 10). (type: integer) (example: 10)')
                .optional(),
            news_site: z
                .string()
                .describe(
                    'Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive. (type: string)'
                )
                .optional(),
            news_site_exclude: z
                .string()
                .describe(
                    'Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive. (type: string)'
                )
                .optional(),
            offset: z
                .number()
                .int()
                .describe('The initial index from which to return the results. (type: integer)')
                .optional(),
            ordering: z
                .union([
                    z.array(
                        z.union([
                            z.literal('-published_at'),
                            z.literal('-updated_at'),
                            z.literal('published_at'),
                            z.literal('updated_at')
                        ])
                    ),
                    z.string()
                ])
                .describe(
                    'Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending) (type: array of string)'
                )
                .optional(),
            published_at_gt: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            published_at_gte: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            published_at_lt: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            published_at_lte: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            search: z
                .string()
                .describe('Search for documents with a specific phrase in the title or summary. (type: string)')
                .optional(),
            summary_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the summary. (type: string)')
                .optional(),
            summary_contains_all: z
                .string()
                .describe(
                    'Search for documents with a summary containing all keywords from comma-separated values. (type: string)'
                )
                .optional(),
            summary_contains_one: z
                .string()
                .describe(
                    'Search for documents with a summary containing at least one keyword from comma-separated values. (type: string)'
                )
                .optional(),
            title_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the title. (type: string)')
                .optional(),
            title_contains_all: z
                .string()
                .describe(
                    'Search for documents with a title containing all keywords from comma-separated values. (type: string)'
                )
                .optional(),
            title_contains_one: z
                .string()
                .describe(
                    'Search for documents with a title containing at least one keyword from comma-separated values. (type: string)'
                )
                .optional(),
            updated_at_gt: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            updated_at_gte: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            updated_at_lt: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            updated_at_lte: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getSpaceflightArticleById: z
        .object({
            id: z.number().int().describe('A unique integer value identifying this article. (type: integer)'),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    listSpaceflightBlogs: z
        .object({
            event: z
                .union([z.array(z.number().int()), z.string()])
                .describe(
                    'Search for all documents related to a specific event using its Launch Library 2 ID. (type: array of integer)'
                )
                .optional(),
            has_event: z.boolean().describe('Get all documents that have a related event. (type: boolean)').optional(),
            has_launch: z
                .boolean()
                .describe('Get all documents that have a related launch. (type: boolean)')
                .optional(),
            is_featured: z.boolean().describe('Get all documents that are featured. (type: boolean)').optional(),
            launch: z
                .union([z.array(z.string()), z.string()])
                .describe(
                    'Search for all documents related to a specific launch using its Launch Library 2 ID. (type: array of string)'
                )
                .optional(),
            limit: z
                .number()
                .int()
                .describe('Number of results per page (default 10, max 10). (type: integer) (example: 10)')
                .optional(),
            news_site: z
                .string()
                .describe(
                    'Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive. (type: string)'
                )
                .optional(),
            news_site_exclude: z
                .string()
                .describe(
                    'Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive. (type: string)'
                )
                .optional(),
            offset: z
                .number()
                .int()
                .describe('The initial index from which to return the results. (type: integer)')
                .optional(),
            ordering: z
                .union([
                    z.array(
                        z.union([
                            z.literal('-published_at'),
                            z.literal('-updated_at'),
                            z.literal('published_at'),
                            z.literal('updated_at')
                        ])
                    ),
                    z.string()
                ])
                .describe(
                    'Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending) (type: array of string)'
                )
                .optional(),
            published_at_gt: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            published_at_gte: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            published_at_lt: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            published_at_lte: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            search: z
                .string()
                .describe('Search for documents with a specific phrase in the title or summary. (type: string)')
                .optional(),
            summary_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the summary. (type: string)')
                .optional(),
            summary_contains_all: z
                .string()
                .describe(
                    'Search for documents with a summary containing all keywords from comma-separated values. (type: string)'
                )
                .optional(),
            summary_contains_one: z
                .string()
                .describe(
                    'Search for documents with a summary containing at least one keyword from comma-separated values. (type: string)'
                )
                .optional(),
            title_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the title. (type: string)')
                .optional(),
            title_contains_all: z
                .string()
                .describe(
                    'Search for documents with a title containing all keywords from comma-separated values. (type: string)'
                )
                .optional(),
            title_contains_one: z
                .string()
                .describe(
                    'Search for documents with a title containing at least one keyword from comma-separated values. (type: string)'
                )
                .optional(),
            updated_at_gt: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            updated_at_gte: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            updated_at_lt: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            updated_at_lte: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getSpaceflightBlogById: z
        .object({
            id: z.number().int().describe('A unique integer value identifying this blog. (type: integer)'),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    listSpaceflightReports: z
        .object({
            limit: z
                .number()
                .int()
                .describe('Number of results per page (default 10, max 10). (type: integer) (example: 10)')
                .optional(),
            news_site: z
                .string()
                .describe(
                    'Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive. (type: string)'
                )
                .optional(),
            news_site_exclude: z
                .string()
                .describe(
                    'Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive. (type: string)'
                )
                .optional(),
            offset: z
                .number()
                .int()
                .describe('The initial index from which to return the results. (type: integer)')
                .optional(),
            ordering: z
                .union([
                    z.array(
                        z.union([
                            z.literal('-published_at'),
                            z.literal('-updated_at'),
                            z.literal('published_at'),
                            z.literal('updated_at')
                        ])
                    ),
                    z.string()
                ])
                .describe(
                    'Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending) (type: array of string)'
                )
                .optional(),
            published_at_gt: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            published_at_gte: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            published_at_lt: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            published_at_lte: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            search: z
                .string()
                .describe('Search for documents with a specific phrase in the title or summary. (type: string)')
                .optional(),
            summary_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the summary. (type: string)')
                .optional(),
            summary_contains_all: z
                .string()
                .describe(
                    'Search for documents with a summary containing all keywords from comma-separated values. (type: string)'
                )
                .optional(),
            summary_contains_one: z
                .string()
                .describe(
                    'Search for documents with a summary containing at least one keyword from comma-separated values. (type: string)'
                )
                .optional(),
            title_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the title. (type: string)')
                .optional(),
            title_contains_all: z
                .string()
                .describe(
                    'Search for documents with a title containing all keywords from comma-separated values. (type: string)'
                )
                .optional(),
            title_contains_one: z
                .string()
                .describe(
                    'Search for documents with a title containing at least one keyword from comma-separated values. (type: string)'
                )
                .optional(),
            updated_at_gt: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            updated_at_gte: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            updated_at_lt: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (excluded). (type: string)')
                .optional(),
            updated_at_lte: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (included). (type: string)')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getSpaceflightReportById: z
        .object({
            id: z.number().int().describe('A unique integer value identifying this report. (type: integer)'),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getSpaceflightInfo: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.')
};

const invokeParamBucketsByTool = {
    listSpaceflightArticles: {
        pathParams: [],
        query: [
            'event',
            'has_event',
            'has_launch',
            'is_featured',
            'launch',
            'limit',
            'news_site',
            'news_site_exclude',
            'offset',
            'ordering',
            'published_at_gt',
            'published_at_gte',
            'published_at_lt',
            'published_at_lte',
            'search',
            'summary_contains',
            'summary_contains_all',
            'summary_contains_one',
            'title_contains',
            'title_contains_all',
            'title_contains_one',
            'updated_at_gt',
            'updated_at_gte',
            'updated_at_lt',
            'updated_at_lte'
        ],
        headers: [],
        arrayQuery: ['event', 'launch', 'ordering']
    },
    getSpaceflightArticleById: {
        pathParams: ['id'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    listSpaceflightBlogs: {
        pathParams: [],
        query: [
            'event',
            'has_event',
            'has_launch',
            'is_featured',
            'launch',
            'limit',
            'news_site',
            'news_site_exclude',
            'offset',
            'ordering',
            'published_at_gt',
            'published_at_gte',
            'published_at_lt',
            'published_at_lte',
            'search',
            'summary_contains',
            'summary_contains_all',
            'summary_contains_one',
            'title_contains',
            'title_contains_all',
            'title_contains_one',
            'updated_at_gt',
            'updated_at_gte',
            'updated_at_lt',
            'updated_at_lte'
        ],
        headers: [],
        arrayQuery: ['event', 'launch', 'ordering']
    },
    getSpaceflightBlogById: {
        pathParams: ['id'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    listSpaceflightReports: {
        pathParams: [],
        query: [
            'limit',
            'news_site',
            'news_site_exclude',
            'offset',
            'ordering',
            'published_at_gt',
            'published_at_gte',
            'published_at_lt',
            'published_at_lte',
            'search',
            'summary_contains',
            'summary_contains_all',
            'summary_contains_one',
            'title_contains',
            'title_contains_all',
            'title_contains_one',
            'updated_at_gt',
            'updated_at_gte',
            'updated_at_lt',
            'updated_at_lte'
        ],
        headers: [],
        arrayQuery: ['ordering']
    },
    getSpaceflightReportById: {
        pathParams: ['id'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    getSpaceflightInfo: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    }
};

function splitInvokeQueryArrayValue(value: string): ReadonlyArray<string | number | boolean> {
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function prepareQueryBucket(toolName: string, bucket: InvokeOptions['query']): InvokeOptions['query'] {
    if (!bucket) {
        return undefined;
    }
    const arrayQueryKeys = new Set(
        (invokeParamBucketsByTool as Record<string, { arrayQuery?: string[] }>)[toolName]?.arrayQuery ?? []
    );
    const out: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (arrayQueryKeys.has(key) && typeof value === 'string') {
            out[key] = splitInvokeQueryArrayValue(value);
            continue;
        }
        out[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function omitNullishPathParams(
    bucket: Record<string, string | number | boolean> | undefined
): Record<string, string | number | boolean> | undefined {
    if (!bucket) {
        return undefined;
    }
    const out: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        out[key] = value;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function isInvokeQueryBucketValue(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeInvokeOptions(toolName: string, options: InvokeOptions): InvokeOptions {
    const buckets = (
        invokeParamBucketsByTool as Record<
            string,
            { pathParams?: string[]; query?: string[]; headers?: string[]; arrayQuery?: string[] }
        >
    )[toolName];
    if (!buckets) {
        return options;
    }
    const pathKeys = buckets.pathParams ?? [];
    const queryKeys = buckets.query ?? [];
    const headerKeys = buckets.headers ?? [];
    const arrayQueryKeys = new Set(buckets.arrayQuery ?? []);
    const knownFlatKeys = new Set([...pathKeys, ...queryKeys, ...headerKeys]);
    const hasTopLevelFlatParam = Object.keys(options).some((key) => {
        if (key === 'body' || key === 'pathParams' || key === 'headers') {
            return false;
        }
        if (key === 'query') {
            return queryKeys.includes('query') && !isInvokeQueryBucketValue(options.query);
        }
        return knownFlatKeys.has(key);
    });
    if (!hasTopLevelFlatParam) {
        return {
            ...options,
            pathParams: omitNullishPathParams(options.pathParams),
            query: prepareQueryBucket(toolName, isInvokeQueryBucketValue(options.query) ? options.query : undefined)
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> =
        isInvokeQueryBucketValue(options.query)
            ? {
                  ...(options.query as Record<
                      string,
                      string | number | boolean | ReadonlyArray<string | number | boolean>
                  >)
              }
            : {};
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams') {
            continue;
        }
        if (key === 'query') {
            if (queryKeys.includes('query') && !isInvokeQueryBucketValue(value)) {
                if (arrayQueryKeys.has(key) && typeof value === 'string') {
                    query[key] = splitInvokeQueryArrayValue(value);
                } else {
                    query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
                }
            }
            continue;
        }
        if (key === 'headers') {
            if (headerKeys.length === 0 && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(headers, value as Record<string, string>);
            }
            continue;
        }
        if (pathKeys.includes(key)) {
            pathParams[key] = value as string | number | boolean;
        } else if (queryKeys.includes(key)) {
            if (arrayQueryKeys.has(key) && typeof value === 'string') {
                query[key] = splitInvokeQueryArrayValue(value);
            } else {
                query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
            }
        } else if (headerKeys.includes(key)) {
            headers[key] = String(value);
        }
    }

    return {
        pathParams: omitNullishPathParams(pathParams),
        query: prepareQueryBucket(toolName, query),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: options.body
    };
}
const queryParamSerializationByTool = {
    listSpaceflightArticles: {
        event: {
            style: 'form',
            explode: false
        },
        has_event: {
            style: 'form',
            explode: true
        },
        has_launch: {
            style: 'form',
            explode: true
        },
        is_featured: {
            style: 'form',
            explode: true
        },
        launch: {
            style: 'form',
            explode: false
        },
        limit: {
            style: 'form',
            explode: true
        },
        news_site: {
            style: 'form',
            explode: true
        },
        news_site_exclude: {
            style: 'form',
            explode: true
        },
        offset: {
            style: 'form',
            explode: true
        },
        ordering: {
            style: 'form',
            explode: false
        },
        published_at_gt: {
            style: 'form',
            explode: true
        },
        published_at_gte: {
            style: 'form',
            explode: true
        },
        published_at_lt: {
            style: 'form',
            explode: true
        },
        published_at_lte: {
            style: 'form',
            explode: true
        },
        search: {
            style: 'form',
            explode: true
        },
        summary_contains: {
            style: 'form',
            explode: true
        },
        summary_contains_all: {
            style: 'form',
            explode: true
        },
        summary_contains_one: {
            style: 'form',
            explode: true
        },
        title_contains: {
            style: 'form',
            explode: true
        },
        title_contains_all: {
            style: 'form',
            explode: true
        },
        title_contains_one: {
            style: 'form',
            explode: true
        },
        updated_at_gt: {
            style: 'form',
            explode: true
        },
        updated_at_gte: {
            style: 'form',
            explode: true
        },
        updated_at_lt: {
            style: 'form',
            explode: true
        },
        updated_at_lte: {
            style: 'form',
            explode: true
        }
    },
    getSpaceflightArticleById: {},
    listSpaceflightBlogs: {
        event: {
            style: 'form',
            explode: false
        },
        has_event: {
            style: 'form',
            explode: true
        },
        has_launch: {
            style: 'form',
            explode: true
        },
        is_featured: {
            style: 'form',
            explode: true
        },
        launch: {
            style: 'form',
            explode: false
        },
        limit: {
            style: 'form',
            explode: true
        },
        news_site: {
            style: 'form',
            explode: true
        },
        news_site_exclude: {
            style: 'form',
            explode: true
        },
        offset: {
            style: 'form',
            explode: true
        },
        ordering: {
            style: 'form',
            explode: false
        },
        published_at_gt: {
            style: 'form',
            explode: true
        },
        published_at_gte: {
            style: 'form',
            explode: true
        },
        published_at_lt: {
            style: 'form',
            explode: true
        },
        published_at_lte: {
            style: 'form',
            explode: true
        },
        search: {
            style: 'form',
            explode: true
        },
        summary_contains: {
            style: 'form',
            explode: true
        },
        summary_contains_all: {
            style: 'form',
            explode: true
        },
        summary_contains_one: {
            style: 'form',
            explode: true
        },
        title_contains: {
            style: 'form',
            explode: true
        },
        title_contains_all: {
            style: 'form',
            explode: true
        },
        title_contains_one: {
            style: 'form',
            explode: true
        },
        updated_at_gt: {
            style: 'form',
            explode: true
        },
        updated_at_gte: {
            style: 'form',
            explode: true
        },
        updated_at_lt: {
            style: 'form',
            explode: true
        },
        updated_at_lte: {
            style: 'form',
            explode: true
        }
    },
    getSpaceflightBlogById: {},
    listSpaceflightReports: {
        limit: {
            style: 'form',
            explode: true
        },
        news_site: {
            style: 'form',
            explode: true
        },
        news_site_exclude: {
            style: 'form',
            explode: true
        },
        offset: {
            style: 'form',
            explode: true
        },
        ordering: {
            style: 'form',
            explode: false
        },
        published_at_gt: {
            style: 'form',
            explode: true
        },
        published_at_gte: {
            style: 'form',
            explode: true
        },
        published_at_lt: {
            style: 'form',
            explode: true
        },
        published_at_lte: {
            style: 'form',
            explode: true
        },
        search: {
            style: 'form',
            explode: true
        },
        summary_contains: {
            style: 'form',
            explode: true
        },
        summary_contains_all: {
            style: 'form',
            explode: true
        },
        summary_contains_one: {
            style: 'form',
            explode: true
        },
        title_contains: {
            style: 'form',
            explode: true
        },
        title_contains_all: {
            style: 'form',
            explode: true
        },
        title_contains_one: {
            style: 'form',
            explode: true
        },
        updated_at_gt: {
            style: 'form',
            explode: true
        },
        updated_at_gte: {
            style: 'form',
            explode: true
        },
        updated_at_lt: {
            style: 'form',
            explode: true
        },
        updated_at_lte: {
            style: 'form',
            explode: true
        }
    },
    getSpaceflightReportById: {},
    getSpaceflightInfo: {}
};
const queryParamWireNamesByTool = {
    listSpaceflightArticles: {},
    getSpaceflightArticleById: {},
    listSpaceflightBlogs: {},
    getSpaceflightBlogById: {},
    listSpaceflightReports: {},
    getSpaceflightReportById: {},
    getSpaceflightInfo: {}
};
const pathParamWireNamesByTool = {
    listSpaceflightArticles: {},
    getSpaceflightArticleById: {},
    listSpaceflightBlogs: {},
    getSpaceflightBlogById: {},
    listSpaceflightReports: {},
    getSpaceflightReportById: {},
    getSpaceflightInfo: {}
};
const headerParamWireNamesByTool = {
    listSpaceflightArticles: {},
    getSpaceflightArticleById: {},
    listSpaceflightBlogs: {},
    getSpaceflightBlogById: {},
    listSpaceflightReports: {},
    getSpaceflightReportById: {},
    getSpaceflightInfo: {}
};

function appendSerializedQueryParams(
    searchParams: URLSearchParams,
    toolName: string,
    query: InvokeOptions['query']
): void {
    if (!query) {
        return;
    }
    const hintsByParam: Record<string, { style?: string; explode?: boolean }> =
        (queryParamSerializationByTool as Record<string, Record<string, { style?: string; explode?: boolean }>>)[
            toolName
        ] ?? {};
    const wireNames: Record<string, string> =
        (queryParamWireNamesByTool as Record<string, Record<string, string>>)[toolName] ?? {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        const wireKey = wireNames[key] ?? key;
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
            const parts: string[] = [];
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
                    searchParams.append(wireKey, p);
                }
            } else {
                searchParams.set(wireKey, parts.join(','));
            }
            continue;
        }
        searchParams.set(wireKey, String(value));
    }
}

async function performToolHttpRequest(
    url: URL,
    init: { method: string; headers: Record<string, string>; body?: string }
): Promise<Response> {
    if (init.method !== 'TRACE') {
        return fetch(url, init as RequestInit);
    }
    const client = url.protocol === 'https:' ? await import('node:https') : await import('node:http');
    return new Promise((resolve, reject) => {
        const req = client.request(
            {
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port || undefined,
                path: url.pathname + url.search,
                method: 'TRACE',
                headers: init.headers
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer) => chunks.push(chunk));
                res.on('end', () => {
                    const responseHeaders = new Headers();
                    for (const [name, value] of Object.entries(res.headers)) {
                        if (value === undefined) {
                            continue;
                        }
                        if (Array.isArray(value)) {
                            for (const entry of value) {
                                responseHeaders.append(name, entry);
                            }
                        } else {
                            responseHeaders.set(name, value);
                        }
                    }
                    resolve(
                        new Response(Buffer.concat(chunks), {
                            status: res.statusCode ?? 500,
                            headers: responseHeaders
                        })
                    );
                });
            }
        );
        req.on('error', reject);
        if (init.body) {
            req.write(init.body);
        }
        req.end();
    });
}

export async function invokeTool(
    toolName: string,
    options: InvokeOptions = {},
    hostContext?: ApiHostContext
): Promise<unknown> {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }
    loggingAdapter.debug('invokeTool', { toolName, method: tool.method, path: tool.path });
    let optionsResolved = normalizeInvokeOptions(toolName, options);

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (servers/*-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let credential: string | undefined = host.credential?.trim() ? String(host.credential).trim() : undefined;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on the MCP host; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        credential = String(inbound).trim();
    }
    if (tool.hasPrepareToolCall) {
        const prepareToolCall = prepareToolCallHooks[toolName];
        if (typeof prepareToolCall !== 'function') {
            throw new Error('No prepareToolCall hook for tool: ' + toolName);
        }
        if (tool.access === 'protected') {
            if (credential === undefined) {
                throw new Error('prepareToolCall requires credential for protected tools.');
            }
            optionsResolved = await Promise.resolve(prepareToolCall(optionsResolved, credential));
        } else {
            optionsResolved = await Promise.resolve(prepareToolCall(optionsResolved));
        }
    }
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    const pathWireNames: Record<string, string> =
        (pathParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        const wireKey = pathWireNames[key] ?? key;
        resolvedPath = resolvedPath.split('{' + wireKey + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const headerWireNames: Record<string, string> =
        (headerParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json'
    };
    if (optionsResolved.headers) {
        for (const [key, value] of Object.entries(optionsResolved.headers)) {
            const wireKey = headerWireNames[key] ?? key;
            requestHeaders[wireKey] = value;
        }
    }

    const requestInit: Record<string, unknown> = {
        method: tool.method,
        headers: requestHeaders
    };

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }

    const response = await performToolHttpRequest(url, {
        method: tool.method,
        headers: requestHeaders as Record<string, string>,
        body: typeof requestInit.body === 'string' ? requestInit.body : undefined
    });
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            /* ignore unreadable error body */
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            if (tool.access === 'protected') {
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
        loggingAdapter.error(msg, { toolName: tool.toolName, status: response.status });
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
