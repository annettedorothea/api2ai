/**
 * Generated from: tmdb.api2ai
 * Referenced OpenAPI: ./openapi/tmdb.openapi.json
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.js';

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
        toolName: 'searchTmdbMovies',
        title: 'Search movies by title',
        description:
            'Intent:\nsearch TMDB movies by title\n\nMCP arguments:\npass query, include_adult, language, primary_release_year, page, region, year as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nSearch for movies by their original, translated and alternative titles.\n\nMeta:\noperationId: search-movie\n\nParameters:\n- include_adult (query)\n- language (query)\n- page (query)\n- primary_release_year (query)\n- query (query)\n- region (query)\n- year (query)\n\nExample:\nFind movies named Dune\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/search/movie',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getPopularTmdbMovies',
        title: 'Popular movies',
        description:
            'Intent:\nretrieve currently popular TMDB movies\n\nMCP arguments:\npass language, page, region as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nGet a list of movies ordered by popularity.\n\nMeta:\noperationId: movie-popular-list\n\nParameters:\n- language (query)\n- page (query)\n- region (query): ISO-3166-1 code\n\nExample:\nShow popular movies\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/popular',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieDetails',
        title: 'Movie details by ID',
        description:
            'Intent:\nretrieve details for a TMDB movie by id\n\nMCP arguments:\npass movie_id, append_to_response, language as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nGet the top level details of a movie by ID.\n\nMeta:\noperationId: movie-details\n\nParameters:\n- movie_id (path)\n- append_to_response (query): comma separated list of endpoints within this namespace, 20 items max\n- language (query)\n\nExample:\nGet details for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): adult, backdrop_path, belongs_to_collection, budget, genres, homepage, id, imdb_id, origin_country, original_language, original_title, overview, popularity, poster_path, production_companies, production_countries, release_date, revenue, runtime, spoken_languages, status, tagline, title, video, vote_average, vote_count\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieCredits',
        title: 'Movie cast and crew',
        description:
            'Intent:\nretrieve cast and crew credits for a TMDB movie\n\nMCP arguments:\npass movie_id, language as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: movie-credits\n\nParameters:\n- movie_id (path)\n- language (query)\n\nExample:\nWho played in movie id 693134?\n\nResponse:\nHTTP 200\n200\nproperties (top-level): cast, crew, id\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/credits',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'discoverTmdbMovies',
        title: 'Discover movies with filters',
        description:
            'Intent:\n- Discover movies with OpenAPI query filters (genre, year, vote_average, sort_by, etc.).\n        - Use getTmdbMovieGenres first when the user names a genre in natural language.\n        - Prefer searchTmdbMovies for a known title; use this tool for "best sci-fi 2024" style queries.\n        - with_genres: genre id as string (e.g. "878" for sci-fi from getTmdbMovieGenres); comma/pipe for AND/OR.\n        - primary_release_year: number (e.g. 2024), not a string.\n        - Example query: with_genres "878", primary_release_year 2024, sort_by vote_average.desc.\n        - Requires TMDB_ACCESS_TOKEN via MCP host --auth-env.\n\nMCP arguments:\npass certification, certification.gte, certification.lte, certification_country, include_adult, include_video, language, page, primary_release_year, primary_release_date.gte, primary_release_date.lte, region, release_date.gte, release_date.lte, sort_by, vote_average.gte, vote_average.lte, vote_count.gte, vote_count.lte, watch_region, with_cast, with_companies, with_crew, with_genres, with_keywords, with_origin_country, with_original_language, with_people, with_release_type, with_runtime.gte, with_runtime.lte, with_watch_monetization_types, with_watch_providers, without_companies, without_genres, without_keywords, without_watch_providers, year as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nFind movies using over 30 filters and sort options.\n\nMeta:\noperationId: discover-movie\n\nParameters:\n- certification (query): use in conjunction with `region`\n- certification_country (query): use in conjunction with the `certification`, `certification.gte` and `certification.lte` filters\n- certification.gte (query): use in conjunction with `region`\n- certification.lte (query): use in conjunction with `region`\n- include_adult (query)\n- include_video (query)\n- language (query)\n- page (query)\n- primary_release_date.gte (query)\n- primary_release_date.lte (query)\n- primary_release_year (query)\n- region (query)\n- release_date.gte (query)\n- release_date.lte (query)\n- sort_by (query)\n- vote_average.gte (query)\n- vote_average.lte (query)\n- vote_count.gte (query)\n- vote_count.lte (query)\n- watch_region (query): use in conjunction with `with_watch_monetization_types ` or `with_watch_providers `\n- with_cast (query): can be a comma (`AND`) or pipe (`OR`) separated query\n- with_companies (query): can be a comma (`AND`) or pipe (`OR`) separated query\n- with_crew (query): can be a comma (`AND`) or pipe (`OR`) separated query\n- with_genres (query): can be a comma (`AND`) or pipe (`OR`) separated query\n- with_keywords (query): can be a comma (`AND`) or pipe (`OR`) separated query\n- with_origin_country (query)\n- with_original_language (query)\n- with_people (query): can be a comma (`AND`) or pipe (`OR`) separated query\n- with_release_type (query): possible values are: [1, 2, 3, 4, 5, 6] can be a comma (`AND`) or pipe (`OR`) separated query, can be used in conjunction with `region`\n- with_runtime.gte (query)\n- with_runtime.lte (query)\n- with_watch_monetization_types (query): possible values are: [flatrate, free, ads, rent, buy] use in conjunction with `watch_region`, can be a comma (`AND`) or pipe (`OR`) separated query\n- with_watch_providers (query): use in conjunction with `watch_region`, can be a comma (`AND`) or pipe (`OR`) separated query\n- without_companies (query)\n- without_genres (query)\n- without_keywords (query)\n- without_watch_providers (query)\n- year (query)\n\nExample:\nFind highly rated science fiction movies from 2024\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/discover/movie',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieGenres',
        title: 'Movie genre list',
        description:
            'Intent:\nretrieve TMDB movie genres for filtering and lookup\n\nMCP arguments:\npass language as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nGet the list of official genres for movies.\n\nMeta:\noperationId: genre-movie-list\n\nParameters:\n- language (query)\n\nExample:\nList available movie genres\n\nResponse:\nHTTP 200\n200\nproperties (top-level): genres\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/genre/movie/list',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbTrendingMovies',
        title: 'Trending movies',
        description:
            'Intent:\n- Trending TMDB movies for a time window; time_window required: "day" or "week".\n        - Not the same as getPopularTmdbMovies — do not pass page here (trending has no page filter in this tool).\n        - Optional language only (ISO code).\n\nMCP arguments:\npass time_window, language as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nGet the trending movies on TMDB.\n\nMeta:\noperationId: trending-movies\n\nParameters:\n- time_window (path)\n- language (query): `ISO-639-1`-`ISO-3166-1` code\n\nExample:\nTrending movies this week → time_window week\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/trending/movie/{time_window}',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieVideos',
        title: 'Movie videos and trailers',
        description:
            'Intent:\nretrieve videos such as trailers for a TMDB movie\n\nMCP arguments:\npass movie_id, language as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: movie-videos\n\nParameters:\n- movie_id (path)\n- language (query)\n\nExample:\nShow trailers for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/videos',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'searchTmdbMulti',
        title: 'Multi search (movies, TV, people)',
        description:
            'Intent:\nsearch TMDB across movies, tv shows, and people\n\nMCP arguments:\npass query, include_adult, language, page as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nUse multi search when you want to search for movies, TV shows and people in a single request.\n\nMeta:\noperationId: search-multi\n\nParameters:\n- include_adult (query)\n- language (query)\n- page (query)\n- query (query)\n\nExample:\nSearch TMDB for Dune across all media types\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/search/multi',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieReleaseDates',
        title: 'Movie release dates',
        description:
            'Intent:\nretrieve release dates for a TMDB movie\n\nMCP arguments:\npass movie_id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nGet the release dates and certifications for a movie.\n\nMeta:\noperationId: movie-release-dates\n\nParameters:\n- movie_id (path)\n\nExample:\nWhen was movie id 693134 released?\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/release_dates',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieRecommendations',
        title: 'Movie recommendations',
        description:
            'Intent:\nretrieve recommendations for a TMDB movie\n\nMCP arguments:\npass movie_id, language, page as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: movie-recommendations\n\nParameters:\n- movie_id (path)\n- language (query)\n- page (query)\n\nExample:\nRecommendations for movie id 693134\n\nResponse:\nHTTP 200\n200\ntype: object (no inlined properties)\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/recommendations',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieSimilar',
        title: 'Retrieve similar movies',
        description:
            'Intent:\nretrieve similar movies for a TMDB movie\n\nMCP arguments:\npass movie_id, language, page as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nGet the similar movies based on genres and keywords.\n\nMeta:\noperationId: movie-similar\n\nParameters:\n- movie_id (path)\n- language (query)\n- page (query)\n\nExample:\nFind similar movies to 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/similar',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'getTmdbMovieReviews',
        title: 'Retrieve movie reviews',
        description:
            'Intent:\nretrieve reviews for a TMDB movie\n\nMCP arguments:\npass movie_id, language, page as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nGet the user reviews for a movie.\n\nMeta:\noperationId: movie-reviews\n\nParameters:\n- movie_id (path)\n- language (query)\n- page (query)\n\nExample:\nReviews for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, page, results, total_pages, total_results\n\nRuntime: protected — implement src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.ts; credential sent as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/reviews',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
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
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
};

export const requiresAuth = true;
export const authConfig: AuthConfig | undefined = {
    location: 'header',
    name: 'Authorization',
    prefix: 'Bearer '
};

export { verifyCredential } from '../../../src/hooks/api2ai/tmdb-tools/verifyTmdbCredential.js';

export const mcpServerName = 'tmdb-tools';
export const mcpServerVersion = '0.5.0';

export const inputZodByTool = {
    searchTmdbMovies: z
        .object({
            query: z.string(),
            include_adult: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
            language: z.string().optional(),
            primary_release_year: z.string().optional(),
            page: z.union([z.number().int(), z.string()]).optional(),
            region: z.string().optional(),
            year: z.string().optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getPopularTmdbMovies: z
        .object({
            language: z.string().optional(),
            page: z.union([z.number().int(), z.string()]).optional(),
            region: z.string().describe('ISO-3166-1 code').optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieDetails: z
        .object({
            movie_id: z.union([z.number().int(), z.string()]),
            append_to_response: z
                .string()
                .describe('comma separated list of endpoints within this namespace, 20 items max')
                .optional(),
            language: z.string().optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieCredits: z
        .object({
            movie_id: z.union([z.number().int(), z.string()]),
            language: z.string().optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    discoverTmdbMovies: z
        .object({
            certification: z.string().describe('use in conjunction with `region`').optional(),
            'certification.gte': z.string().describe('use in conjunction with `region`').optional(),
            'certification.lte': z.string().describe('use in conjunction with `region`').optional(),
            certification_country: z
                .string()
                .describe(
                    'use in conjunction with the `certification`, `certification.gte` and `certification.lte` filters'
                )
                .optional(),
            include_adult: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
            include_video: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
            language: z.string().optional(),
            page: z.union([z.number().int(), z.string()]).optional(),
            primary_release_year: z.union([z.number().int(), z.string()]).optional(),
            'primary_release_date.gte': z.string().optional(),
            'primary_release_date.lte': z.string().optional(),
            region: z.string().optional(),
            'release_date.gte': z.string().optional(),
            'release_date.lte': z.string().optional(),
            sort_by: z
                .union([
                    z.literal('original_title.asc'),
                    z.literal('original_title.desc'),
                    z.literal('popularity.asc'),
                    z.literal('popularity.desc'),
                    z.literal('revenue.asc'),
                    z.literal('revenue.desc'),
                    z.literal('primary_release_date.asc'),
                    z.literal('title.asc'),
                    z.literal('title.desc'),
                    z.literal('primary_release_date.desc'),
                    z.literal('vote_average.asc'),
                    z.literal('vote_average.desc'),
                    z.literal('vote_count.asc'),
                    z.literal('vote_count.desc')
                ])
                .optional(),
            'vote_average.gte': z.union([z.number(), z.string()]).optional(),
            'vote_average.lte': z.union([z.number(), z.string()]).optional(),
            'vote_count.gte': z.union([z.number(), z.string()]).optional(),
            'vote_count.lte': z.union([z.number(), z.string()]).optional(),
            watch_region: z
                .string()
                .describe('use in conjunction with `with_watch_monetization_types ` or `with_watch_providers `')
                .optional(),
            with_cast: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
            with_companies: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
            with_crew: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
            with_genres: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
            with_keywords: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
            with_origin_country: z.string().optional(),
            with_original_language: z.string().optional(),
            with_people: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
            with_release_type: z
                .union([z.number().int(), z.string()])
                .describe(
                    'possible values are: [1, 2, 3, 4, 5, 6] can be a comma (`AND`) or pipe (`OR`) separated query, can be used in conjunction with `region`'
                )
                .optional(),
            'with_runtime.gte': z.union([z.number().int(), z.string()]).optional(),
            'with_runtime.lte': z.union([z.number().int(), z.string()]).optional(),
            with_watch_monetization_types: z
                .string()
                .describe(
                    'possible values are: [flatrate, free, ads, rent, buy] use in conjunction with `watch_region`, can be a comma (`AND`) or pipe (`OR`) separated query'
                )
                .optional(),
            with_watch_providers: z
                .string()
                .describe(
                    'use in conjunction with `watch_region`, can be a comma (`AND`) or pipe (`OR`) separated query'
                )
                .optional(),
            without_companies: z.string().optional(),
            without_genres: z.string().optional(),
            without_keywords: z.string().optional(),
            without_watch_providers: z.string().optional(),
            year: z.union([z.number().int(), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieGenres: z
        .object({
            language: z.string().optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbTrendingMovies: z
        .object({
            time_window: z.union([z.literal('day'), z.literal('week')]),
            language: z.string().describe('`ISO-639-1`-`ISO-3166-1` code').optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieVideos: z
        .object({
            movie_id: z.union([z.number().int(), z.string()]),
            language: z.string().optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    searchTmdbMulti: z
        .object({
            query: z.string(),
            include_adult: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
            language: z.string().optional(),
            page: z.union([z.number().int(), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieReleaseDates: z
        .object({
            movie_id: z.union([z.number().int(), z.string()]),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieRecommendations: z
        .object({
            movie_id: z.union([z.number().int(), z.string()]),
            language: z.string().optional(),
            page: z.union([z.number().int(), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieSimilar: z
        .object({
            movie_id: z.union([z.number().int(), z.string()]),
            language: z.string().optional(),
            page: z.union([z.number().int(), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    getTmdbMovieReviews: z
        .object({
            movie_id: z.union([z.number().int(), z.string()]),
            language: z.string().optional(),
            page: z.union([z.number().int(), z.string()]).optional(),
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
    searchTmdbMovies: {
        pathParams: [],
        query: ['query', 'include_adult', 'language', 'primary_release_year', 'page', 'region', 'year'],
        headers: [],
        arrayQuery: []
    },
    getPopularTmdbMovies: {
        pathParams: [],
        query: ['language', 'page', 'region'],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieDetails: {
        pathParams: ['movie_id'],
        query: ['append_to_response', 'language'],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieCredits: {
        pathParams: ['movie_id'],
        query: ['language'],
        headers: [],
        arrayQuery: []
    },
    discoverTmdbMovies: {
        pathParams: [],
        query: [
            'certification',
            'certification.gte',
            'certification.lte',
            'certification_country',
            'include_adult',
            'include_video',
            'language',
            'page',
            'primary_release_year',
            'primary_release_date.gte',
            'primary_release_date.lte',
            'region',
            'release_date.gte',
            'release_date.lte',
            'sort_by',
            'vote_average.gte',
            'vote_average.lte',
            'vote_count.gte',
            'vote_count.lte',
            'watch_region',
            'with_cast',
            'with_companies',
            'with_crew',
            'with_genres',
            'with_keywords',
            'with_origin_country',
            'with_original_language',
            'with_people',
            'with_release_type',
            'with_runtime.gte',
            'with_runtime.lte',
            'with_watch_monetization_types',
            'with_watch_providers',
            'without_companies',
            'without_genres',
            'without_keywords',
            'without_watch_providers',
            'year'
        ],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieGenres: {
        pathParams: [],
        query: ['language'],
        headers: [],
        arrayQuery: []
    },
    getTmdbTrendingMovies: {
        pathParams: ['time_window'],
        query: ['language'],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieVideos: {
        pathParams: ['movie_id'],
        query: ['language'],
        headers: [],
        arrayQuery: []
    },
    searchTmdbMulti: {
        pathParams: [],
        query: ['query', 'include_adult', 'language', 'page'],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieReleaseDates: {
        pathParams: ['movie_id'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieRecommendations: {
        pathParams: ['movie_id'],
        query: ['language', 'page'],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieSimilar: {
        pathParams: ['movie_id'],
        query: ['language', 'page'],
        headers: [],
        arrayQuery: []
    },
    getTmdbMovieReviews: {
        pathParams: ['movie_id'],
        query: ['language', 'page'],
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
    searchTmdbMovies: {
        query: {
            style: 'form',
            explode: true
        },
        include_adult: {
            style: 'form',
            explode: true
        },
        language: {
            style: 'form',
            explode: true
        },
        primary_release_year: {
            style: 'form',
            explode: true
        },
        page: {
            style: 'form',
            explode: true
        },
        region: {
            style: 'form',
            explode: true
        },
        year: {
            style: 'form',
            explode: true
        }
    },
    getPopularTmdbMovies: {
        language: {
            style: 'form',
            explode: true
        },
        page: {
            style: 'form',
            explode: true
        },
        region: {
            style: 'form',
            explode: true
        }
    },
    getTmdbMovieDetails: {
        append_to_response: {
            style: 'form',
            explode: true
        },
        language: {
            style: 'form',
            explode: true
        }
    },
    getTmdbMovieCredits: {
        language: {
            style: 'form',
            explode: true
        }
    },
    discoverTmdbMovies: {
        certification: {
            style: 'form',
            explode: true
        },
        'certification.gte': {
            style: 'form',
            explode: true
        },
        'certification.lte': {
            style: 'form',
            explode: true
        },
        certification_country: {
            style: 'form',
            explode: true
        },
        include_adult: {
            style: 'form',
            explode: true
        },
        include_video: {
            style: 'form',
            explode: true
        },
        language: {
            style: 'form',
            explode: true
        },
        page: {
            style: 'form',
            explode: true
        },
        primary_release_year: {
            style: 'form',
            explode: true
        },
        'primary_release_date.gte': {
            style: 'form',
            explode: true
        },
        'primary_release_date.lte': {
            style: 'form',
            explode: true
        },
        region: {
            style: 'form',
            explode: true
        },
        'release_date.gte': {
            style: 'form',
            explode: true
        },
        'release_date.lte': {
            style: 'form',
            explode: true
        },
        sort_by: {
            style: 'form',
            explode: true
        },
        'vote_average.gte': {
            style: 'form',
            explode: true
        },
        'vote_average.lte': {
            style: 'form',
            explode: true
        },
        'vote_count.gte': {
            style: 'form',
            explode: true
        },
        'vote_count.lte': {
            style: 'form',
            explode: true
        },
        watch_region: {
            style: 'form',
            explode: true
        },
        with_cast: {
            style: 'form',
            explode: true
        },
        with_companies: {
            style: 'form',
            explode: true
        },
        with_crew: {
            style: 'form',
            explode: true
        },
        with_genres: {
            style: 'form',
            explode: true
        },
        with_keywords: {
            style: 'form',
            explode: true
        },
        with_origin_country: {
            style: 'form',
            explode: true
        },
        with_original_language: {
            style: 'form',
            explode: true
        },
        with_people: {
            style: 'form',
            explode: true
        },
        with_release_type: {
            style: 'form',
            explode: true
        },
        'with_runtime.gte': {
            style: 'form',
            explode: true
        },
        'with_runtime.lte': {
            style: 'form',
            explode: true
        },
        with_watch_monetization_types: {
            style: 'form',
            explode: true
        },
        with_watch_providers: {
            style: 'form',
            explode: true
        },
        without_companies: {
            style: 'form',
            explode: true
        },
        without_genres: {
            style: 'form',
            explode: true
        },
        without_keywords: {
            style: 'form',
            explode: true
        },
        without_watch_providers: {
            style: 'form',
            explode: true
        },
        year: {
            style: 'form',
            explode: true
        }
    },
    getTmdbMovieGenres: {
        language: {
            style: 'form',
            explode: true
        }
    },
    getTmdbTrendingMovies: {
        language: {
            style: 'form',
            explode: true
        }
    },
    getTmdbMovieVideos: {
        language: {
            style: 'form',
            explode: true
        }
    },
    searchTmdbMulti: {
        query: {
            style: 'form',
            explode: true
        },
        include_adult: {
            style: 'form',
            explode: true
        },
        language: {
            style: 'form',
            explode: true
        },
        page: {
            style: 'form',
            explode: true
        }
    },
    getTmdbMovieReleaseDates: {},
    getTmdbMovieRecommendations: {
        language: {
            style: 'form',
            explode: true
        },
        page: {
            style: 'form',
            explode: true
        }
    },
    getTmdbMovieSimilar: {
        language: {
            style: 'form',
            explode: true
        },
        page: {
            style: 'form',
            explode: true
        }
    },
    getTmdbMovieReviews: {
        language: {
            style: 'form',
            explode: true
        },
        page: {
            style: 'form',
            explode: true
        }
    }
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

function resolveAuthSecret(
    authConfig: { location: 'header' | 'query'; name: string; prefix?: string },
    credential: string | undefined
): string {
    if (!credential || !String(credential).trim()) {
        throw new Error(
            'Missing host credential (stdio: --auth-env; HTTP: auth header; OAuth HTTP: Bearer after MCP login).'
        );
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
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
    const optionsResolved = normalizeInvokeOptions(toolName, options);

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let authCredential: string | undefined = host.credential?.trim() ? String(host.credential).trim() : undefined;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        const credential = String(inbound).trim();
        await verifyCredential(credential);
        authCredential = credential;
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
    if (authConfig && tool.access === 'protected') {
        const authValue = resolveAuthSecret(authConfig!, authCredential);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
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
            if (authConfig && tool.access === 'protected') {
                msg +=
                    ' Check MCP host --auth-env on stdio-mcp-server (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
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
