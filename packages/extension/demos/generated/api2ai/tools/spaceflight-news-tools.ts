/**
 * Generated from: spaceflight-news.api2ai
 * Referenced OpenAPI: ./openapi/spaceflight-news.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { prepareListSpaceflightArticlesInput } from '../../../src/hooks/api2ai/spaceflight-news-tools/listSpaceflightArticles.js';
import { prepareListSpaceflightBlogsInput } from '../../../src/hooks/api2ai/spaceflight-news-tools/listSpaceflightBlogs.js';
import { prepareListSpaceflightReportsInput } from '../../../src/hooks/api2ai/spaceflight-news-tools/listSpaceflightReports.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasAuthorize: boolean;
    hasPrepare: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'listSpaceflightArticles',
        title: 'List spaceflight articles (limit validated, teaser only; full text at response url)',
        description:
            'Intent:\n- List recent spaceflight news articles (pagination: limit, offset, ordering).\n        - Query limit caps how many articles are returned (default 10, max 10).\n        - Response contains title, summary teaser, and url per item — not the full article body.\n        - Use search, has_launch, or news_site filters for SpaceX, launches, or specific outlets.\n        - Follow result url only when full text is needed (same pattern for blogs and reports tools).\n\nMCP arguments:\npass event, has_event, has_launch, is_featured, launch, limit, news_site, news_site_exclude, offset, ordering, published_at_gt, published_at_gte, published_at_lt, published_at_lte, search, summary_contains, summary_contains_all, summary_contains_one, title_contains, title_contains_all, title_contains_one, updated_at_gt, updated_at_gte, updated_at_lt, updated_at_lte as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: articles | operationId: articles_list\n\nParameters:\n- event (query): Search for all documents related to a specific event using its Launch Library 2 ID.\n- has_event (query): Get all documents that have a related event.\n- has_launch (query): Get all documents that have a related launch.\n- is_featured (query): Get all documents that are featured.\n- launch (query): Search for all documents related to a specific launch using its Launch Library 2 ID.\n- limit (query): Number of results per page (default 10, max 10). (example: 10)\n- news_site (query): Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.\n- news_site_exclude (query): Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.\n- offset (query): The initial index from which to return the results.\n- ordering (query): Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)\n- published_at_gt (query): Get all documents published after a given ISO8601 timestamp (excluded).\n- published_at_gte (query): Get all documents published after a given ISO8601 timestamp (included).\n- published_at_lt (query): Get all documents published before a given ISO8601 timestamp (excluded).\n- published_at_lte (query): Get all documents published before a given ISO8601 timestamp (included).\n- search (query): Search for documents with a specific phrase in the title or summary.\n- summary_contains (query): Search for all documents with a specific phrase in the summary.\n- summary_contains_all (query): Search for documents with a summary containing all keywords from comma-separated values.\n- summary_contains_one (query): Search for documents with a summary containing at least one keyword from comma-separated values.\n- title_contains (query): Search for all documents with a specific phrase in the title.\n- title_contains_all (query): Search for documents with a title containing all keywords from comma-separated values.\n- title_contains_one (query): Search for documents with a title containing at least one keyword from comma-separated values.\n- updated_at_gt (query): Get all documents updated after a given ISO8601 timestamp (excluded).\n- updated_at_gte (query): Get all documents updated after a given ISO8601 timestamp (included).\n- updated_at_lt (query): Get all documents updated before a given ISO8601 timestamp (excluded).\n- updated_at_lte (query): Get all documents updated before a given ISO8601 timestamp (included).\n\nExample:\nGet the latest 5 articles\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results\n\nRuntime: implement prepareListSpaceflightArticlesInput in src/hooks/api2ai/spaceflight-news-tools/listSpaceflightArticles.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/v4/articles/',
        access: 'public',
        hasAuthorize: false,
        hasPrepare: true
    },
    {
        toolName: 'getSpaceflightArticleById',
        title: 'Get article by ID (teaser only; full text at response url)',
        description:
            'Intent:\nget one spaceflight article by id; API returns summary teaser only, full article text at url\n\nMCP arguments:\npass id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: articles | operationId: articles_retrieve\n\nParameters:\n- id (path): A unique integer value identifying this article.\n\nExample:\nGet article with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/articles/{id}/',
        access: 'public',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'listSpaceflightBlogs',
        title: 'List spaceflight blog posts (limit validated, teaser only; full text at response url)',
        description:
            'Intent:\n- List recent spaceflight blog posts (pagination: limit, offset, ordering).\n        - Query limit caps how many blog posts are returned (default 10, max 10).\n        - Response contains title, summary teaser, and url per item — not the full post body.\n        - Use search, has_launch, or news_site filters for SpaceX, launches, or specific outlets.\n        - Follow result url only when full text is needed (same pattern for articles and reports tools).\n\nMCP arguments:\npass event, has_event, has_launch, is_featured, launch, limit, news_site, news_site_exclude, offset, ordering, published_at_gt, published_at_gte, published_at_lt, published_at_lte, search, summary_contains, summary_contains_all, summary_contains_one, title_contains, title_contains_all, title_contains_one, updated_at_gt, updated_at_gte, updated_at_lt, updated_at_lte as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: blogs | operationId: blogs_list\n\nParameters:\n- event (query): Search for all documents related to a specific event using its Launch Library 2 ID.\n- has_event (query): Get all documents that have a related event.\n- has_launch (query): Get all documents that have a related launch.\n- is_featured (query): Get all documents that are featured.\n- launch (query): Search for all documents related to a specific launch using its Launch Library 2 ID.\n- limit (query): Number of results per page (default 10, max 10). (example: 10)\n- news_site (query): Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.\n- news_site_exclude (query): Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.\n- offset (query): The initial index from which to return the results.\n- ordering (query): Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)\n- published_at_gt (query): Get all documents published after a given ISO8601 timestamp (excluded).\n- published_at_gte (query): Get all documents published after a given ISO8601 timestamp (included).\n- published_at_lt (query): Get all documents published before a given ISO8601 timestamp (excluded).\n- published_at_lte (query): Get all documents published before a given ISO8601 timestamp (included).\n- search (query): Search for documents with a specific phrase in the title or summary.\n- summary_contains (query): Search for all documents with a specific phrase in the summary.\n- summary_contains_all (query): Search for documents with a summary containing all keywords from comma-separated values.\n- summary_contains_one (query): Search for documents with a summary containing at least one keyword from comma-separated values.\n- title_contains (query): Search for all documents with a specific phrase in the title.\n- title_contains_all (query): Search for documents with a title containing all keywords from comma-separated values.\n- title_contains_one (query): Search for documents with a title containing at least one keyword from comma-separated values.\n- updated_at_gt (query): Get all documents updated after a given ISO8601 timestamp (excluded).\n- updated_at_gte (query): Get all documents updated after a given ISO8601 timestamp (included).\n- updated_at_lt (query): Get all documents updated before a given ISO8601 timestamp (excluded).\n- updated_at_lte (query): Get all documents updated before a given ISO8601 timestamp (included).\n\nExample:\nGet the latest 5 blog posts\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results\n\nRuntime: implement prepareListSpaceflightBlogsInput in src/hooks/api2ai/spaceflight-news-tools/listSpaceflightBlogs.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/v4/blogs/',
        access: 'public',
        hasAuthorize: false,
        hasPrepare: true
    },
    {
        toolName: 'getSpaceflightBlogById',
        title: 'Get blog post by ID (teaser only; full text at response url)',
        description:
            'Intent:\nget one spaceflight blog post by id; API returns summary teaser only, full post text at url\n\nMCP arguments:\npass id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: blogs | operationId: blogs_retrieve\n\nParameters:\n- id (path): A unique integer value identifying this blog.\n\nExample:\nGet blog post with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/blogs/{id}/',
        access: 'public',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'listSpaceflightReports',
        title: 'List spaceflight reports (limit validated, teaser only; full text at response url)',
        description:
            'Intent:\n- List recent spaceflight reports (pagination: limit, offset, ordering).\n        - Query limit caps how many reports are returned (default 10, max 10).\n        - Response contains title, summary teaser, and url per item — not the full report body.\n        - Use search or news_site filters for specific outlets or topics.\n        - Follow result url only when full text is needed (same pattern for articles and blogs tools).\n\nMCP arguments:\npass limit, news_site, news_site_exclude, offset, ordering, published_at_gt, published_at_gte, published_at_lt, published_at_lte, search, summary_contains, summary_contains_all, summary_contains_one, title_contains, title_contains_all, title_contains_one, updated_at_gt, updated_at_gte, updated_at_lt, updated_at_lte as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: reports | operationId: reports_list\n\nParameters:\n- limit (query): Number of results per page (default 10, max 10). (example: 10)\n- news_site (query): Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.\n- news_site_exclude (query): Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.\n- offset (query): The initial index from which to return the results.\n- ordering (query): Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)\n- published_at_gt (query): Get all documents published after a given ISO8601 timestamp (excluded).\n- published_at_gte (query): Get all documents published after a given ISO8601 timestamp (included).\n- published_at_lt (query): Get all documents published before a given ISO8601 timestamp (excluded).\n- published_at_lte (query): Get all documents published before a given ISO8601 timestamp (included).\n- search (query): Search for documents with a specific phrase in the title or summary.\n- summary_contains (query): Search for all documents with a specific phrase in the summary.\n- summary_contains_all (query): Search for documents with a summary containing all keywords from comma-separated values.\n- summary_contains_one (query): Search for documents with a summary containing at least one keyword from comma-separated values.\n- title_contains (query): Search for all documents with a specific phrase in the title.\n- title_contains_all (query): Search for documents with a title containing all keywords from comma-separated values.\n- title_contains_one (query): Search for documents with a title containing at least one keyword from comma-separated values.\n- updated_at_gt (query): Get all documents updated after a given ISO8601 timestamp (excluded).\n- updated_at_gte (query): Get all documents updated after a given ISO8601 timestamp (included).\n- updated_at_lt (query): Get all documents updated before a given ISO8601 timestamp (excluded).\n- updated_at_lte (query): Get all documents updated before a given ISO8601 timestamp (included).\n\nExample:\nGet the latest 5 reports\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results\n\nRuntime: implement prepareListSpaceflightReportsInput in src/hooks/api2ai/spaceflight-news-tools/listSpaceflightReports.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/v4/reports/',
        access: 'public',
        hasAuthorize: false,
        hasPrepare: true
    },
    {
        toolName: 'getSpaceflightReportById',
        title: 'Get report by ID (teaser only; full text at response url)',
        description:
            'Intent:\nget one spaceflight report by id; API returns summary teaser only, full report text at url\n\nMCP arguments:\npass id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\ntags: reports | operationId: reports_retrieve\n\nParameters:\n- id (path): A unique integer value identifying this report.\n\nExample:\nGet report with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, id, image_url, news_site, published_at, summary, title, updated_at, url\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/reports/{id}/',
        access: 'public',
        hasAuthorize: false,
        hasPrepare: false
    },
    {
        toolName: 'getSpaceflightInfo',
        title: 'Spaceflight News API metadata',
        description:
            'Intent:\nretrieve spaceflight API metadata and news sites\n\nMeta:\ntags: info | operationId: info_retrieve\n\nExample:\nShow API info and available news sites\n\nResponse:\nHTTP 200\nproperties (top-level): news_sites, version\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v4/info/',
        access: 'public',
        hasAuthorize: false,
        hasPrepare: false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by stdio-mcp-server / http-mcp-server). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
    upstreamCredential?: string;
    credentials?: unknown;
};

export const requiresAuth = false;

export const mcpServerName = 'spaceflight-news-tools';
export const mcpServerVersion = '0.5.0';

const preparers: Record<string, (options: InvokeOptions) => InvokeOptions | Promise<InvokeOptions>> = {
    listSpaceflightArticles: prepareListSpaceflightArticlesInput,
    listSpaceflightBlogs: prepareListSpaceflightBlogsInput,
    listSpaceflightReports: prepareListSpaceflightReportsInput
};

export const inputZodByTool = {
    listSpaceflightArticles: z
        .object({
            event: z
                .union([z.array(z.union([z.number().int(), z.string()])), z.string()])
                .describe('Search for all documents related to a specific event using its Launch Library 2 ID.')
                .optional(),
            has_event: z
                .union([z.boolean(), z.literal('true'), z.literal('false')])
                .describe('Get all documents that have a related event.')
                .optional(),
            has_launch: z
                .union([z.boolean(), z.literal('true'), z.literal('false')])
                .describe('Get all documents that have a related launch.')
                .optional(),
            is_featured: z
                .union([z.boolean(), z.literal('true'), z.literal('false')])
                .describe('Get all documents that are featured.')
                .optional(),
            launch: z
                .union([z.array(z.string()), z.string()])
                .describe('Search for all documents related to a specific launch using its Launch Library 2 ID.')
                .optional(),
            limit: z
                .union([z.number().int(), z.string()])
                .describe('Number of results per page (default 10, max 10). (example: 10)')
                .optional(),
            news_site: z
                .string()
                .describe(
                    'Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.'
                )
                .optional(),
            news_site_exclude: z
                .string()
                .describe(
                    'Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.'
                )
                .optional(),
            offset: z
                .union([z.number().int(), z.string()])
                .describe('The initial index from which to return the results.')
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
                    'Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)'
                )
                .optional(),
            published_at_gt: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (excluded).')
                .optional(),
            published_at_gte: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (included).')
                .optional(),
            published_at_lt: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (excluded).')
                .optional(),
            published_at_lte: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (included).')
                .optional(),
            search: z
                .string()
                .describe('Search for documents with a specific phrase in the title or summary.')
                .optional(),
            summary_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the summary.')
                .optional(),
            summary_contains_all: z
                .string()
                .describe('Search for documents with a summary containing all keywords from comma-separated values.')
                .optional(),
            summary_contains_one: z
                .string()
                .describe(
                    'Search for documents with a summary containing at least one keyword from comma-separated values.'
                )
                .optional(),
            title_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the title.')
                .optional(),
            title_contains_all: z
                .string()
                .describe('Search for documents with a title containing all keywords from comma-separated values.')
                .optional(),
            title_contains_one: z
                .string()
                .describe(
                    'Search for documents with a title containing at least one keyword from comma-separated values.'
                )
                .optional(),
            updated_at_gt: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (excluded).')
                .optional(),
            updated_at_gte: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (included).')
                .optional(),
            updated_at_lt: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (excluded).')
                .optional(),
            updated_at_lte: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (included).')
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
            id: z.union([z.number().int(), z.string()]).describe('A unique integer value identifying this article.'),
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
                .union([z.array(z.union([z.number().int(), z.string()])), z.string()])
                .describe('Search for all documents related to a specific event using its Launch Library 2 ID.')
                .optional(),
            has_event: z
                .union([z.boolean(), z.literal('true'), z.literal('false')])
                .describe('Get all documents that have a related event.')
                .optional(),
            has_launch: z
                .union([z.boolean(), z.literal('true'), z.literal('false')])
                .describe('Get all documents that have a related launch.')
                .optional(),
            is_featured: z
                .union([z.boolean(), z.literal('true'), z.literal('false')])
                .describe('Get all documents that are featured.')
                .optional(),
            launch: z
                .union([z.array(z.string()), z.string()])
                .describe('Search for all documents related to a specific launch using its Launch Library 2 ID.')
                .optional(),
            limit: z
                .union([z.number().int(), z.string()])
                .describe('Number of results per page (default 10, max 10). (example: 10)')
                .optional(),
            news_site: z
                .string()
                .describe(
                    'Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.'
                )
                .optional(),
            news_site_exclude: z
                .string()
                .describe(
                    'Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.'
                )
                .optional(),
            offset: z
                .union([z.number().int(), z.string()])
                .describe('The initial index from which to return the results.')
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
                    'Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)'
                )
                .optional(),
            published_at_gt: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (excluded).')
                .optional(),
            published_at_gte: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (included).')
                .optional(),
            published_at_lt: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (excluded).')
                .optional(),
            published_at_lte: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (included).')
                .optional(),
            search: z
                .string()
                .describe('Search for documents with a specific phrase in the title or summary.')
                .optional(),
            summary_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the summary.')
                .optional(),
            summary_contains_all: z
                .string()
                .describe('Search for documents with a summary containing all keywords from comma-separated values.')
                .optional(),
            summary_contains_one: z
                .string()
                .describe(
                    'Search for documents with a summary containing at least one keyword from comma-separated values.'
                )
                .optional(),
            title_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the title.')
                .optional(),
            title_contains_all: z
                .string()
                .describe('Search for documents with a title containing all keywords from comma-separated values.')
                .optional(),
            title_contains_one: z
                .string()
                .describe(
                    'Search for documents with a title containing at least one keyword from comma-separated values.'
                )
                .optional(),
            updated_at_gt: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (excluded).')
                .optional(),
            updated_at_gte: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (included).')
                .optional(),
            updated_at_lt: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (excluded).')
                .optional(),
            updated_at_lte: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (included).')
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
            id: z.union([z.number().int(), z.string()]).describe('A unique integer value identifying this blog.'),
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
                .union([z.number().int(), z.string()])
                .describe('Number of results per page (default 10, max 10). (example: 10)')
                .optional(),
            news_site: z
                .string()
                .describe(
                    'Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive.'
                )
                .optional(),
            news_site_exclude: z
                .string()
                .describe(
                    'Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive.'
                )
                .optional(),
            offset: z
                .union([z.number().int(), z.string()])
                .describe('The initial index from which to return the results.')
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
                    'Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)'
                )
                .optional(),
            published_at_gt: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (excluded).')
                .optional(),
            published_at_gte: z
                .string()
                .describe('Get all documents published after a given ISO8601 timestamp (included).')
                .optional(),
            published_at_lt: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (excluded).')
                .optional(),
            published_at_lte: z
                .string()
                .describe('Get all documents published before a given ISO8601 timestamp (included).')
                .optional(),
            search: z
                .string()
                .describe('Search for documents with a specific phrase in the title or summary.')
                .optional(),
            summary_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the summary.')
                .optional(),
            summary_contains_all: z
                .string()
                .describe('Search for documents with a summary containing all keywords from comma-separated values.')
                .optional(),
            summary_contains_one: z
                .string()
                .describe(
                    'Search for documents with a summary containing at least one keyword from comma-separated values.'
                )
                .optional(),
            title_contains: z
                .string()
                .describe('Search for all documents with a specific phrase in the title.')
                .optional(),
            title_contains_all: z
                .string()
                .describe('Search for documents with a title containing all keywords from comma-separated values.')
                .optional(),
            title_contains_one: z
                .string()
                .describe(
                    'Search for documents with a title containing at least one keyword from comma-separated values.'
                )
                .optional(),
            updated_at_gt: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (excluded).')
                .optional(),
            updated_at_gte: z
                .string()
                .describe('Get all documents updated after a given ISO8601 timestamp (included).')
                .optional(),
            updated_at_lt: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (excluded).')
                .optional(),
            updated_at_lte: z
                .string()
                .describe('Get all documents updated before a given ISO8601 timestamp (included).')
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
            id: z.union([z.number().int(), z.string()]).describe('A unique integer value identifying this report.'),
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
const invokeBodySchemaByTool = {};

function coerceInvokeScalar(value: string | number | boolean): string | number | boolean {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === 'true') {
            return true;
        }
        if (trimmed === 'false') {
            return false;
        }
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            const parsed = Number(trimmed);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }
    return value;
}

function coerceInvokePathBucket(
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
        out[key] = coerceInvokeScalar(value);
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function coerceInvokeQueryArrayValue(value: string): ReadonlyArray<string | number | boolean> {
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => coerceInvokeScalar(part));
}

function coerceInvokeQueryBucket(toolName: string, bucket: InvokeOptions['query']): InvokeOptions['query'] {
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
        if (Array.isArray(value)) {
            out[key] = value.map((element) => coerceInvokeScalar(element));
            continue;
        }
        if (arrayQueryKeys.has(key) && typeof value === 'string') {
            out[key] = coerceInvokeQueryArrayValue(value);
            continue;
        }
        out[key] = coerceInvokeScalar(value as string | number | boolean);
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function coerceInvokeValueBySchema(value: unknown, schema: Record<string, unknown> | undefined): unknown {
    if (!schema || value === undefined || value === null) {
        return value;
    }
    const type = schema.type;
    if (type === 'integer' || type === 'number') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return coerceInvokeScalar(value as string | number | boolean);
        }
        return value;
    }
    if (type === 'boolean') {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === 'true') {
                return true;
            }
            if (trimmed === 'false') {
                return false;
            }
        }
        return value;
    }
    if (type === 'array') {
        const items = schema.items as Record<string, unknown> | undefined;
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((part) => part.trim())
                .filter((part) => part.length > 0)
                .map((part) => (items ? coerceInvokeValueBySchema(part, items) : coerceInvokeScalar(part)));
        }
        if (Array.isArray(value)) {
            return value.map((element) =>
                items
                    ? coerceInvokeValueBySchema(element, items)
                    : coerceInvokeScalar(element as string | number | boolean)
            );
        }
        return value;
    }
    if (
        type === 'object' &&
        schema.properties &&
        typeof schema.properties === 'object' &&
        !Array.isArray(schema.properties) &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    ) {
        const props = schema.properties as Record<string, Record<string, unknown>>;
        const out: Record<string, unknown> = {};
        for (const [key, element] of Object.entries(value as Record<string, unknown>)) {
            if (element === undefined || element === null) {
                continue;
            }
            const propSchema = props[key];
            out[key] = propSchema ? coerceInvokeValueBySchema(element, propSchema) : element;
        }
        return out;
    }
    return value;
}

function coerceInvokeBody(toolName: string, body: unknown): unknown {
    if (body === undefined || body === null) {
        return body;
    }
    const schema = (invokeBodySchemaByTool as Record<string, Record<string, unknown> | undefined>)[toolName];
    if (!schema) {
        return body;
    }
    return coerceInvokeValueBySchema(body, schema);
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
    const hasTopLevelFlatParam = Object.keys(options).some(
        (key) =>
            key !== 'body' && key !== 'headers' && key !== 'pathParams' && key !== 'query' && knownFlatKeys.has(key)
    );
    if (!hasTopLevelFlatParam) {
        return {
            ...options,
            pathParams: coerceInvokePathBucket(options.pathParams),
            query: coerceInvokeQueryBucket(toolName, options.query),
            body: coerceInvokeBody(toolName, options.body)
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {
        ...(options.query ?? {})
    };
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams' || key === 'query') {
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
                query[key] = coerceInvokeQueryArrayValue(value);
            } else {
                query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
            }
        } else if (headerKeys.includes(key)) {
            headers[key] = String(value);
        }
    }

    return {
        pathParams: coerceInvokePathBucket(pathParams),
        query: coerceInvokeQueryBucket(toolName, query),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: coerceInvokeBody(toolName, options.body)
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
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;

    if (tool.hasPrepare) {
        const prepare = preparers[toolName];
        if (typeof prepare !== 'function') {
            throw new Error('No preparer for tool: ' + toolName);
        }
        optionsResolved = await Promise.resolve(prepare(optionsResolved));
    }
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json',
        ...(optionsResolved.headers ?? {})
    };

    const requestInit: Record<string, unknown> = {
        method: tool.method,
        headers: requestHeaders
    };

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }

    const response = await fetch(url, requestInit as RequestInit);
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
