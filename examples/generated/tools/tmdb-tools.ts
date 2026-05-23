/**
 * Generated from: tmdb.api2ai
 * Referenced OpenAPI: ./openapi/tmdb.openapi.json
 */

export const insecureTls = false;

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
};

export const generatedTools: GeneratedTool[] = [
    {
        "toolName": "searchTmdbMovies",
        "title": "Search movies by title",
        "description": "Intent:\nsearch TMDB movies by title\n\nAPI:\nSearch for movies by their original, translated and alternative titles.\n\nMeta:\noperationId: search-movie\n\nExample:\nFind movies named Dune\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/search/movie",
        "example": "Find movies named Dune"
    },
    {
        "toolName": "getPopularTmdbMovies",
        "title": "Popular movies",
        "description": "Intent:\nretrieve currently popular TMDB movies\n\nAPI:\nGet a list of movies ordered by popularity.\n\nMeta:\noperationId: movie-popular-list\n\nExample:\nShow popular movies\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/popular",
        "example": "Show popular movies"
    },
    {
        "toolName": "getTmdbMovieDetails",
        "title": "Movie details by ID",
        "description": "Intent:\nretrieve details for a TMDB movie by id\n\nAPI:\nGet the top level details of a movie by ID.\n\nMeta:\noperationId: movie-details\n\nExample:\nGet details for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): adult, backdrop_path, belongs_to_collection, budget, genres, homepage, id, imdb_id, origin_country, original_language, original_title, overview, popularity, poster_path, production_companies, production_countries, release_date, revenue, runtime, spoken_languages, status, tagline, title, video, vote_average, vote_count\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/{movie_id}",
        "example": "Get details for movie id 693134"
    },
    {
        "toolName": "getTmdbMovieCredits",
        "title": "Movie cast and crew",
        "description": "Intent:\nretrieve cast and crew credits for a TMDB movie\n\nMeta:\noperationId: movie-credits\n\nExample:\nWho played in movie id 693134?\n\nResponse:\nHTTP 200\n200\nproperties (top-level): cast, crew, id\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/{movie_id}/credits",
        "example": "Who played in movie id 693134?"
    },
    {
        "toolName": "discoverTmdbMovies",
        "title": "Discover movies with filters",
        "description": "Intent:\ndiscover TMDB movies using rich filters such as genre, year, and rating\n\nAPI:\nFind movies using over 30 filters and sort options.\n\nMeta:\noperationId: discover-movie\n\nExample:\nFind highly rated science fiction movies from 2024\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/discover/movie",
        "example": "Find highly rated science fiction movies from 2024"
    },
    {
        "toolName": "getTmdbMovieGenres",
        "title": "Movie genre list",
        "description": "Intent:\nretrieve TMDB movie genres for filtering and lookup\n\nAPI:\nGet the list of official genres for movies.\n\nMeta:\noperationId: genre-movie-list\n\nExample:\nList available movie genres\n\nResponse:\nHTTP 200\n200\nproperties (top-level): genres\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/genre/movie/list",
        "example": "List available movie genres"
    },
    {
        "toolName": "getTmdbTrendingMovies",
        "title": "Trending movies",
        "description": "Intent:\nretrieve trending TMDB movies for a selected time window\n\nAPI:\nGet the trending movies on TMDB.\n\nMeta:\noperationId: trending-movies\n\nExample:\nShow trending movies this week\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/trending/movie/{time_window}",
        "example": "Show trending movies this week"
    },
    {
        "toolName": "getTmdbMovieVideos",
        "title": "Movie videos and trailers",
        "description": "Intent:\nretrieve videos such as trailers for a TMDB movie\n\nMeta:\noperationId: movie-videos\n\nExample:\nShow trailers for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/{movie_id}/videos",
        "example": "Show trailers for movie id 693134"
    },
    {
        "toolName": "searchTmdbMulti",
        "title": "Multi search (movies, TV, people)",
        "description": "Intent:\nsearch TMDB across movies, tv shows, and people\n\nAPI:\nUse multi search when you want to search for movies, TV shows and people in a single request.\n\nMeta:\noperationId: search-multi\n\nExample:\nSearch TMDB for Dune across all media types\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/search/multi",
        "example": "Search TMDB for Dune across all media types"
    },
    {
        "toolName": "getTmdbMovieReleaseDates",
        "title": "Movie release dates",
        "description": "Intent:\nretrieve release dates for a TMDB movie\n\nAPI:\nGet the release dates and certifications for a movie.\n\nMeta:\noperationId: movie-release-dates\n\nExample:\nWhen was movie id 693134 released?\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/{movie_id}/release_dates",
        "example": "When was movie id 693134 released?"
    },
    {
        "toolName": "getTmdbMovieRecommendations",
        "title": "Movie recommendations",
        "description": "Intent:\nretrieve recommendations for a TMDB movie\n\nMeta:\noperationId: movie-recommendations\n\nExample:\nRecommendations for movie id 693134\n\nResponse:\nHTTP 200\n200\ntype: object (no inlined properties)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/{movie_id}/recommendations",
        "example": "Recommendations for movie id 693134"
    },
    {
        "toolName": "getTmdbMovieSimilar",
        "title": "Retrieve similar movies",
        "description": "Intent:\nretrieve similar movies for a TMDB movie\n\nAPI:\nGet the similar movies based on genres and keywords.\n\nMeta:\noperationId: movie-similar\n\nExample:\nFind similar movies to 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/{movie_id}/similar",
        "example": "Find similar movies to 693134"
    },
    {
        "toolName": "getTmdbMovieReviews",
        "title": "Retrieve movie reviews",
        "description": "Intent:\nretrieve reviews for a TMDB movie\n\nAPI:\nGet the user reviews for a movie.\n\nMeta:\noperationId: movie-reviews\n\nExample:\nReviews for movie id 693134\n\nResponse:\nHTTP 200\n200\nproperties (top-level): id, page, results, total_pages, total_results\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/3/movie/{movie_id}/reviews",
        "example": "Reviews for movie id 693134"
    }
];

export type InvokeOptions = {
    /** Set by MCP host from --base-url-env (required for every invoke). */
    baseUrl: string;
    /** Raw API secret; set by MCP host from --auth-env when requiresAuth is true. */
    credential?: string;
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
};

export const requiresAuth = true;
export const authConfig: AuthConfig | undefined = {
    "location": "header",
    "name": "Authorization",
    "prefix": "Bearer "
};
        
export const inputSchemaByTool = {
    "searchTmdbMovies": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string"
                    },
                    "include_adult": {
                        "default": false,
                        "type": "boolean"
                    },
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    },
                    "primary_release_year": {
                        "type": "string"
                    },
                    "page": {
                        "format": "int32",
                        "default": 1,
                        "type": "integer"
                    },
                    "region": {
                        "type": "string"
                    },
                    "year": {
                        "type": "string"
                    }
                },
                "required": [
                    "query"
                ],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getPopularTmdbMovies": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    },
                    "page": {
                        "format": "int32",
                        "default": 1,
                        "type": "integer"
                    },
                    "region": {
                        "type": "string",
                        "description": "ISO-3166-1 code"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieDetails": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "movie_id": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [
                    "movie_id"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "properties": {
                    "append_to_response": {
                        "type": "string",
                        "description": "comma separated list of endpoints within this namespace, 20 items max"
                    },
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieCredits": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "movie_id": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [
                    "movie_id"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "discoverTmdbMovies": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "properties": {
                    "certification": {
                        "type": "string",
                        "description": "use in conjunction with `region`"
                    },
                    "certification.gte": {
                        "type": "string",
                        "description": "use in conjunction with `region`"
                    },
                    "certification.lte": {
                        "type": "string",
                        "description": "use in conjunction with `region`"
                    },
                    "certification_country": {
                        "type": "string",
                        "description": "use in conjunction with the `certification`, `certification.gte` and `certification.lte` filters"
                    },
                    "include_adult": {
                        "default": false,
                        "type": "boolean"
                    },
                    "include_video": {
                        "default": false,
                        "type": "boolean"
                    },
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    },
                    "page": {
                        "format": "int32",
                        "default": 1,
                        "type": "integer"
                    },
                    "primary_release_year": {
                        "format": "int32",
                        "type": "integer"
                    },
                    "primary_release_date.gte": {
                        "format": "date",
                        "type": "string"
                    },
                    "primary_release_date.lte": {
                        "format": "date",
                        "type": "string"
                    },
                    "region": {
                        "type": "string"
                    },
                    "release_date.gte": {
                        "format": "date",
                        "type": "string"
                    },
                    "release_date.lte": {
                        "format": "date",
                        "type": "string"
                    },
                    "sort_by": {
                        "default": "popularity.desc",
                        "enum": [
                            "original_title.asc",
                            "original_title.desc",
                            "popularity.asc",
                            "popularity.desc",
                            "revenue.asc",
                            "revenue.desc",
                            "primary_release_date.asc",
                            "title.asc",
                            "title.desc",
                            "primary_release_date.desc",
                            "vote_average.asc",
                            "vote_average.desc",
                            "vote_count.asc",
                            "vote_count.desc"
                        ],
                        "type": "string"
                    },
                    "vote_average.gte": {
                        "format": "float",
                        "type": "number"
                    },
                    "vote_average.lte": {
                        "format": "float",
                        "type": "number"
                    },
                    "vote_count.gte": {
                        "format": "float",
                        "type": "number"
                    },
                    "vote_count.lte": {
                        "format": "float",
                        "type": "number"
                    },
                    "watch_region": {
                        "type": "string",
                        "description": "use in conjunction with `with_watch_monetization_types ` or `with_watch_providers `"
                    },
                    "with_cast": {
                        "type": "string",
                        "description": "can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "with_companies": {
                        "type": "string",
                        "description": "can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "with_crew": {
                        "type": "string",
                        "description": "can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "with_genres": {
                        "type": "string",
                        "description": "can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "with_keywords": {
                        "type": "string",
                        "description": "can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "with_origin_country": {
                        "type": "string"
                    },
                    "with_original_language": {
                        "type": "string"
                    },
                    "with_people": {
                        "type": "string",
                        "description": "can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "with_release_type": {
                        "format": "int32",
                        "type": "integer",
                        "description": "possible values are: [1, 2, 3, 4, 5, 6] can be a comma (`AND`) or pipe (`OR`) separated query, can be used in conjunction with `region`"
                    },
                    "with_runtime.gte": {
                        "format": "int32",
                        "type": "integer"
                    },
                    "with_runtime.lte": {
                        "format": "int32",
                        "type": "integer"
                    },
                    "with_watch_monetization_types": {
                        "type": "string",
                        "description": "possible values are: [flatrate, free, ads, rent, buy] use in conjunction with `watch_region`, can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "with_watch_providers": {
                        "type": "string",
                        "description": "use in conjunction with `watch_region`, can be a comma (`AND`) or pipe (`OR`) separated query"
                    },
                    "without_companies": {
                        "type": "string"
                    },
                    "without_genres": {
                        "type": "string"
                    },
                    "without_keywords": {
                        "type": "string"
                    },
                    "without_watch_providers": {
                        "type": "string"
                    },
                    "year": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieGenres": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en",
                        "type": "string"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbTrendingMovies": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "time_window": {
                        "default": "day",
                        "enum": [
                            "day",
                            "week"
                        ],
                        "type": "string"
                    }
                },
                "required": [
                    "time_window"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en-US",
                        "type": "string",
                        "description": "`ISO-639-1`-`ISO-3166-1` code"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieVideos": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "movie_id": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [
                    "movie_id"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "searchTmdbMulti": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string"
                    },
                    "include_adult": {
                        "default": false,
                        "type": "boolean"
                    },
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    },
                    "page": {
                        "format": "int32",
                        "default": 1,
                        "type": "integer"
                    }
                },
                "required": [
                    "query"
                ],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieReleaseDates": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "movie_id": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [
                    "movie_id"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "additionalProperties": true,
                "description": "Optional query overrides."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieRecommendations": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "movie_id": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [
                    "movie_id"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    },
                    "page": {
                        "format": "int32",
                        "default": 1,
                        "type": "integer"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieSimilar": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "movie_id": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [
                    "movie_id"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    },
                    "page": {
                        "format": "int32",
                        "default": 1,
                        "type": "integer"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    },
    "getTmdbMovieReviews": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "movie_id": {
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "required": [
                    "movie_id"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "properties": {
                    "language": {
                        "default": "en-US",
                        "type": "string"
                    },
                    "page": {
                        "format": "int32",
                        "default": 1,
                        "type": "integer"
                    }
                },
                "required": [],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    }
};

export const queryParamSerializationByTool = {
    "searchTmdbMovies": {
        "query": {
            "style": "form",
            "explode": true
        },
        "include_adult": {
            "style": "form",
            "explode": true
        },
        "language": {
            "style": "form",
            "explode": true
        },
        "primary_release_year": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        },
        "region": {
            "style": "form",
            "explode": true
        },
        "year": {
            "style": "form",
            "explode": true
        }
    },
    "getPopularTmdbMovies": {
        "language": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        },
        "region": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbMovieDetails": {
        "append_to_response": {
            "style": "form",
            "explode": true
        },
        "language": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbMovieCredits": {
        "language": {
            "style": "form",
            "explode": true
        }
    },
    "discoverTmdbMovies": {
        "certification": {
            "style": "form",
            "explode": true
        },
        "certification.gte": {
            "style": "form",
            "explode": true
        },
        "certification.lte": {
            "style": "form",
            "explode": true
        },
        "certification_country": {
            "style": "form",
            "explode": true
        },
        "include_adult": {
            "style": "form",
            "explode": true
        },
        "include_video": {
            "style": "form",
            "explode": true
        },
        "language": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        },
        "primary_release_year": {
            "style": "form",
            "explode": true
        },
        "primary_release_date.gte": {
            "style": "form",
            "explode": true
        },
        "primary_release_date.lte": {
            "style": "form",
            "explode": true
        },
        "region": {
            "style": "form",
            "explode": true
        },
        "release_date.gte": {
            "style": "form",
            "explode": true
        },
        "release_date.lte": {
            "style": "form",
            "explode": true
        },
        "sort_by": {
            "style": "form",
            "explode": true
        },
        "vote_average.gte": {
            "style": "form",
            "explode": true
        },
        "vote_average.lte": {
            "style": "form",
            "explode": true
        },
        "vote_count.gte": {
            "style": "form",
            "explode": true
        },
        "vote_count.lte": {
            "style": "form",
            "explode": true
        },
        "watch_region": {
            "style": "form",
            "explode": true
        },
        "with_cast": {
            "style": "form",
            "explode": true
        },
        "with_companies": {
            "style": "form",
            "explode": true
        },
        "with_crew": {
            "style": "form",
            "explode": true
        },
        "with_genres": {
            "style": "form",
            "explode": true
        },
        "with_keywords": {
            "style": "form",
            "explode": true
        },
        "with_origin_country": {
            "style": "form",
            "explode": true
        },
        "with_original_language": {
            "style": "form",
            "explode": true
        },
        "with_people": {
            "style": "form",
            "explode": true
        },
        "with_release_type": {
            "style": "form",
            "explode": true
        },
        "with_runtime.gte": {
            "style": "form",
            "explode": true
        },
        "with_runtime.lte": {
            "style": "form",
            "explode": true
        },
        "with_watch_monetization_types": {
            "style": "form",
            "explode": true
        },
        "with_watch_providers": {
            "style": "form",
            "explode": true
        },
        "without_companies": {
            "style": "form",
            "explode": true
        },
        "without_genres": {
            "style": "form",
            "explode": true
        },
        "without_keywords": {
            "style": "form",
            "explode": true
        },
        "without_watch_providers": {
            "style": "form",
            "explode": true
        },
        "year": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbMovieGenres": {
        "language": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbTrendingMovies": {
        "language": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbMovieVideos": {
        "language": {
            "style": "form",
            "explode": true
        }
    },
    "searchTmdbMulti": {
        "query": {
            "style": "form",
            "explode": true
        },
        "include_adult": {
            "style": "form",
            "explode": true
        },
        "language": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbMovieReleaseDates": {},
    "getTmdbMovieRecommendations": {
        "language": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbMovieSimilar": {
        "language": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        }
    },
    "getTmdbMovieReviews": {
        "language": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        }
    }
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

function resolveAuthSecret(authConfig, options) {
    const secret = options?.credential;
    if (!secret || !String(secret).trim()) {
        throw new Error('Missing API credential (MCP host must pass InvokeOptions.credential from --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(secret).trim();
}

export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    if (!options.baseUrl || !String(options.baseUrl).trim()) {
        throw new Error('Missing baseUrl (MCP host must pass InvokeOptions.baseUrl from --base-url-env).');
    }
    const effectiveBaseUrl = String(options.baseUrl).trim();
    const normalizedBaseUrl = effectiveBaseUrl.endsWith('/') ? effectiveBaseUrl.slice(0, -1) : effectiveBaseUrl;
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(options.pathParams ?? {})) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, options.query);
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };
    if (authConfig) {
        const authValue = resolveAuthSecret(authConfig, options);
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
            if (authConfig) {
                msg +=
                    ' Check MCP host --auth-env and the configured environment variable (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
            } else {
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
