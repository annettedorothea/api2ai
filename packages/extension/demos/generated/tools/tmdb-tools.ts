/**
 * Generated from: tmdb.api2ai
 * Referenced OpenAPI: ./openapi/tmdb.openapi.json
 */
import { loggingAdapter } from '../../src/utils/logging-adapter.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
    access: 'public' | 'protected' | 'checked';
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'searchTmdbMovies',
        title: 'Search movies by title',
        description:
            'Intent:\nsearch TMDB movies by title\n\nAPI:\nSearch for movies by their original, translated and alternative titles.\n\nMeta:\noperationId: search-movie\n\nExample:\nFind movies named Dune\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/search/movie',
        example: 'Find movies named Dune',
        access: 'protected'
    },
    {
        toolName: 'getPopularTmdbMovies',
        title: 'Popular movies',
        description:
            'Intent:\nretrieve currently popular TMDB movies\n\nAPI:\nGet a list of movies ordered by popularity.\n\nMeta:\noperationId: movie-popular-list\n\nExample:\nShow popular movies\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/popular',
        example: 'Show popular movies',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieDetails',
        title: 'Movie details by ID',
        description:
            'Intent:\nretrieve details for a TMDB movie by id\n\nAPI:\nGet the top level details of a movie by ID.\n\nMeta:\noperationId: movie-details\n\nExample:\nGet details for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): adult, backdrop_path, belongs_to_collection, budget, genres, homepage, id, imdb_id, origin_country, original_language, original_title, overview, popularity, poster_path, production_companies, production_countries, release_date, revenue, runtime, spoken_languages, status, tagline, title, video, vote_average, vote_count\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}',
        example: 'Get details for movie id 693134',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieCredits',
        title: 'Movie cast and crew',
        description:
            'Intent:\nretrieve cast and crew credits for a TMDB movie\n\nMeta:\noperationId: movie-credits\n\nExample:\nWho played in movie id 693134?\n\nResponse:\nHTTP 200\n200\nproperties (top-level): cast, crew, id\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/credits',
        example: 'Who played in movie id 693134?',
        access: 'protected'
    },
    {
        toolName: 'discoverTmdbMovies',
        title: 'Discover movies with filters',
        description:
            'Intent:\n- Discover movies with OpenAPI query filters (genre, year, vote_average, sort_by, etc.).\n        - Use getTmdbMovieGenres first when the user names a genre in natural language.\n        - Prefer searchTmdbMovies for a known title; use this tool for "best sci-fi 2024" style queries.\n        - with_genres: genre id as string (e.g. "878" for sci-fi from getTmdbMovieGenres); comma/pipe for AND/OR.\n        - primary_release_year: number (e.g. 2024), not a string.\n        - Example query: with_genres "878", primary_release_year 2024, sort_by vote_average.desc.\n        - Requires TMDB_ACCESS_TOKEN via MCP host --auth-env.\n\nAPI:\nFind movies using over 30 filters and sort options.\n\nMeta:\noperationId: discover-movie\n\nExample:\nFind highly rated science fiction movies from 2024\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/discover/movie',
        example: 'Find highly rated science fiction movies from 2024',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieGenres',
        title: 'Movie genre list',
        description:
            'Intent:\nretrieve TMDB movie genres for filtering and lookup\n\nAPI:\nGet the list of official genres for movies.\n\nMeta:\noperationId: genre-movie-list\n\nExample:\nList available movie genres\n\nResponse:\nHTTP 200\n200\nproperties (top-level): genres\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/genre/movie/list',
        example: 'List available movie genres',
        access: 'protected'
    },
    {
        toolName: 'getTmdbTrendingMovies',
        title: 'Trending movies',
        description:
            'Intent:\n- Trending TMDB movies for a time window; pathParams.time_window required: "day" or "week".\n        - Not the same as getPopularTmdbMovies — do not pass query.page here (trending has no page filter in this tool).\n        - Optional query.language only (ISO code).\n\nAPI:\nGet the trending movies on TMDB.\n\nMeta:\noperationId: trending-movies\n\nExample:\nTrending movies this week → pathParams.time_window week\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/trending/movie/{time_window}',
        example: 'Trending movies this week → pathParams.time_window week',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieVideos',
        title: 'Movie videos and trailers',
        description:
            'Intent:\nretrieve videos such as trailers for a TMDB movie\n\nMeta:\noperationId: movie-videos\n\nExample:\nShow trailers for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/videos',
        example: 'Show trailers for movie id 693134',
        access: 'protected'
    },
    {
        toolName: 'searchTmdbMulti',
        title: 'Multi search (movies, TV, people)',
        description:
            'Intent:\nsearch TMDB across movies, tv shows, and people\n\nAPI:\nUse multi search when you want to search for movies, TV shows and people in a single request.\n\nMeta:\noperationId: search-multi\n\nExample:\nSearch TMDB for Dune across all media types\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/search/multi',
        example: 'Search TMDB for Dune across all media types',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieReleaseDates',
        title: 'Movie release dates',
        description:
            'Intent:\nretrieve release dates for a TMDB movie\n\nAPI:\nGet the release dates and certifications for a movie.\n\nMeta:\noperationId: movie-release-dates\n\nExample:\nWhen was movie id 693134 released?\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/release_dates',
        example: 'When was movie id 693134 released?',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieRecommendations',
        title: 'Movie recommendations',
        description:
            'Intent:\nretrieve recommendations for a TMDB movie\n\nMeta:\noperationId: movie-recommendations\n\nExample:\nRecommendations for movie id 693134\n\nResponse:\nHTTP 200\n200\ntype: object (no inlined properties)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/recommendations',
        example: 'Recommendations for movie id 693134',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieSimilar',
        title: 'Retrieve similar movies',
        description:
            'Intent:\nretrieve similar movies for a TMDB movie\n\nAPI:\nGet the similar movies based on genres and keywords.\n\nMeta:\noperationId: movie-similar\n\nExample:\nFind similar movies to 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/similar',
        example: 'Find similar movies to 693134',
        access: 'protected'
    },
    {
        toolName: 'getTmdbMovieReviews',
        title: 'Retrieve movie reviews',
        description:
            'Intent:\nretrieve reviews for a TMDB movie\n\nAPI:\nGet the user reviews for a movie.\n\nMeta:\noperationId: movie-reviews\n\nExample:\nReviews for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header "Authorization" (prefix applied to the secret).',
        method: 'GET',
        path: '/3/movie/{movie_id}/reviews',
        example: 'Reviews for movie id 693134',
        access: 'protected'
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
    jwt?: Record<string, unknown>;
};

export type CheckedHostContext = {
    credential: string;
    jwt?: Record<string, unknown>;
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

export const mcpServerName = 'tmdb-tools';
export const mcpServerVersion = '0.1.0';

import * as z from 'zod/v4';

export const inputZodByTool = {
    searchTmdbMovies: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({
                    query: z.string(),
                    include_adult: z.boolean().optional(),
                    language: z.string().optional(),
                    primary_release_year: z.string().optional(),
                    page: z.number().optional(),
                    region: z.string().optional(),
                    year: z.string().optional()
                })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({
                    language: z.string().optional(),
                    page: z.number().optional(),
                    region: z.string().describe('ISO-3166-1 code').optional()
                })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z.object({ movie_id: z.number() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .object({
                    append_to_response: z
                        .string()
                        .describe('comma separated list of endpoints within this namespace, 20 items max')
                        .optional(),
                    language: z.string().optional()
                })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z.object({ movie_id: z.number() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .object({ language: z.string().optional() })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
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
                    include_adult: z.boolean().optional(),
                    include_video: z.boolean().optional(),
                    language: z.string().optional(),
                    page: z.number().optional(),
                    primary_release_year: z.number().optional(),
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
                    'vote_average.gte': z.number().optional(),
                    'vote_average.lte': z.number().optional(),
                    'vote_count.gte': z.number().optional(),
                    'vote_count.lte': z.number().optional(),
                    watch_region: z
                        .string()
                        .describe('use in conjunction with `with_watch_monetization_types ` or `with_watch_providers `')
                        .optional(),
                    with_cast: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
                    with_companies: z
                        .string()
                        .describe('can be a comma (`AND`) or pipe (`OR`) separated query')
                        .optional(),
                    with_crew: z.string().describe('can be a comma (`AND`) or pipe (`OR`) separated query').optional(),
                    with_genres: z
                        .string()
                        .describe('can be a comma (`AND`) or pipe (`OR`) separated query')
                        .optional(),
                    with_keywords: z
                        .string()
                        .describe('can be a comma (`AND`) or pipe (`OR`) separated query')
                        .optional(),
                    with_origin_country: z.string().optional(),
                    with_original_language: z.string().optional(),
                    with_people: z
                        .string()
                        .describe('can be a comma (`AND`) or pipe (`OR`) separated query')
                        .optional(),
                    with_release_type: z
                        .number()
                        .describe(
                            'possible values are: [1, 2, 3, 4, 5, 6] can be a comma (`AND`) or pipe (`OR`) separated query, can be used in conjunction with `region`'
                        )
                        .optional(),
                    'with_runtime.gte': z.number().optional(),
                    'with_runtime.lte': z.number().optional(),
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
                    year: z.number().optional()
                })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({ language: z.string().optional() })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z
                .object({ time_window: z.union([z.literal('day'), z.literal('week')]) })
                .strict()
                .describe('Path parameters from OpenAPI.'),
            query: z
                .object({ language: z.string().describe('`ISO-639-1`-`ISO-3166-1` code').optional() })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z.object({ movie_id: z.number() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .object({ language: z.string().optional() })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({
                    query: z.string(),
                    include_adult: z.boolean().optional(),
                    language: z.string().optional(),
                    page: z.number().optional()
                })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z.object({ movie_id: z.number() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Optional query overrides.')
                .optional(),
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
            pathParams: z.object({ movie_id: z.number() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .object({ language: z.string().optional(), page: z.number().optional() })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z.object({ movie_id: z.number() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .object({ language: z.string().optional(), page: z.number().optional() })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
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
            pathParams: z.object({ movie_id: z.number() }).strict().describe('Path parameters from OpenAPI.'),
            query: z
                .object({ language: z.string().optional(), page: z.number().optional() })
                .strict()
                .describe('Query parameters from OpenAPI.')
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.')
};

export const queryParamSerializationByTool = {
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

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl, credential } = host;
    if (tool.access !== 'public') {
        if (!credential || !String(credential).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; stateless HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
    }
    const optionsResolved = options;
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
    if (authConfig && tool.access !== 'public') {
        const authValue = resolveAuthSecret(authConfig!, credential);
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
            if (authConfig && tool.access !== 'public') {
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
