/**
 * Generated from: spaceflight-news.api2ai
 * Referenced OpenAPI: ./openapi/spaceflight-news.openapi.yaml
 */

export const baseUrl = "https://api.spaceflightnewsapi.net";

export const generatedTools = [
    {
        "toolName": "listSpaceflightArticles",
        "title": "List spaceflight articles (teaser only; full text at response url)",
        "description": "Intent:\nlist recent spaceflight news articles; API returns summary teaser only, full article text at each result url\n\nMeta:\ntags: articles | operationId: articles_list\n\nExample:\nGet the latest 5 articles\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results",
        "method": "GET",
        "path": "/v4/articles/",
        "example": "Get the latest 5 articles"
    },
    {
        "toolName": "getSpaceflightArticleById",
        "title": "Get article by ID (teaser only; full text at response url)",
        "description": "Intent:\nget one spaceflight article by id; API returns summary teaser only, full article text at url\n\nMeta:\ntags: articles | operationId: articles_retrieve\n\nExample:\nGet article with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url",
        "method": "GET",
        "path": "/v4/articles/{id}/",
        "example": "Get article with id 1"
    },
    {
        "toolName": "listSpaceflightBlogs",
        "title": "List spaceflight blog posts (teaser only; full text at response url)",
        "description": "Intent:\nlist recent spaceflight blog posts; API returns summary teaser only, full post text at each result url\n\nMeta:\ntags: blogs | operationId: blogs_list\n\nExample:\nGet the latest 5 blog posts\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results",
        "method": "GET",
        "path": "/v4/blogs/",
        "example": "Get the latest 5 blog posts"
    },
    {
        "toolName": "getSpaceflightBlogById",
        "title": "Get blog post by ID (teaser only; full text at response url)",
        "description": "Intent:\nget one spaceflight blog post by id; API returns summary teaser only, full post text at url\n\nMeta:\ntags: blogs | operationId: blogs_retrieve\n\nExample:\nGet blog post with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, events, featured, id, image_url, launches, news_site, published_at, summary, title, updated_at, url",
        "method": "GET",
        "path": "/v4/blogs/{id}/",
        "example": "Get blog post with id 1"
    },
    {
        "toolName": "listSpaceflightReports",
        "title": "List spaceflight reports (teaser only; full text at response url)",
        "description": "Intent:\nlist recent spaceflight reports; API returns summary teaser only, full report text at each result url\n\nMeta:\ntags: reports | operationId: reports_list\n\nExample:\nGet the latest 5 reports\n\nResponse:\nHTTP 200\nproperties (top-level): count, next, previous, results",
        "method": "GET",
        "path": "/v4/reports/",
        "example": "Get the latest 5 reports"
    },
    {
        "toolName": "getSpaceflightReportById",
        "title": "Get report by ID (teaser only; full text at response url)",
        "description": "Intent:\nget one spaceflight report by id; API returns summary teaser only, full report text at url\n\nMeta:\ntags: reports | operationId: reports_retrieve\n\nExample:\nGet report with id 1\n\nResponse:\nHTTP 200\nproperties (top-level): authors, id, image_url, news_site, published_at, summary, title, updated_at, url",
        "method": "GET",
        "path": "/v4/reports/{id}/",
        "example": "Get report with id 1"
    },
    {
        "toolName": "getSpaceflightInfo",
        "title": "Spaceflight News API metadata",
        "description": "Intent:\nretrieve spaceflight API metadata and news sites\n\nMeta:\ntags: info | operationId: info_retrieve\n\nExample:\nShow API info and available news sites\n\nResponse:\nHTTP 200\nproperties (top-level): news_sites, version",
        "method": "GET",
        "path": "/v4/info/",
        "example": "Show API info and available news sites"
    }
];

const authConfig = undefined;

export const inputSchemaByTool = {
    "listSpaceflightArticles": {
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
                    "event": {
                        "type": "array",
                        "items": {
                            "type": "integer"
                        },
                        "description": "Search for all documents related to a specific event using its Launch Library 2 ID."
                    },
                    "has_event": {
                        "type": "boolean",
                        "description": "Get all documents that have a related event."
                    },
                    "has_launch": {
                        "type": "boolean",
                        "description": "Get all documents that have a related launch."
                    },
                    "is_featured": {
                        "type": "boolean",
                        "description": "Get all documents that are featured."
                    },
                    "launch": {
                        "type": "array",
                        "items": {
                            "format": "uuid",
                            "type": "string"
                        },
                        "description": "Search for all documents related to a specific launch using its Launch Library 2 ID."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of results to return per page."
                    },
                    "news_site": {
                        "type": "string",
                        "description": "Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive."
                    },
                    "news_site_exclude": {
                        "type": "string",
                        "description": "Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive."
                    },
                    "offset": {
                        "type": "integer",
                        "description": "The initial index from which to return the results."
                    },
                    "ordering": {
                        "type": "array",
                        "items": {
                            "enum": [
                                "-published_at",
                                "-updated_at",
                                "published_at",
                                "updated_at"
                            ],
                            "type": "string"
                        },
                        "description": "Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)"
                    },
                    "published_at_gt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published after a given ISO8601 timestamp (excluded)."
                    },
                    "published_at_gte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published after a given ISO8601 timestamp (included)."
                    },
                    "published_at_lt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published before a given ISO8601 timestamp (excluded)."
                    },
                    "published_at_lte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published before a given ISO8601 timestamp (included)."
                    },
                    "search": {
                        "type": "string",
                        "description": "Search for documents with a specific phrase in the title or summary."
                    },
                    "summary_contains": {
                        "type": "string",
                        "description": "Search for all documents with a specific phrase in the summary."
                    },
                    "summary_contains_all": {
                        "type": "string",
                        "description": "Search for documents with a summary containing all keywords from comma-separated values."
                    },
                    "summary_contains_one": {
                        "type": "string",
                        "description": "Search for documents with a summary containing at least one keyword from comma-separated values."
                    },
                    "title_contains": {
                        "type": "string",
                        "description": "Search for all documents with a specific phrase in the title."
                    },
                    "title_contains_all": {
                        "type": "string",
                        "description": "Search for documents with a title containing all keywords from comma-separated values."
                    },
                    "title_contains_one": {
                        "type": "string",
                        "description": "Search for documents with a title containing at least one keyword from comma-separated values."
                    },
                    "updated_at_gt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated after a given ISO8601 timestamp (excluded)."
                    },
                    "updated_at_gte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated after a given ISO8601 timestamp (included)."
                    },
                    "updated_at_lt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated before a given ISO8601 timestamp (excluded)."
                    },
                    "updated_at_lte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated before a given ISO8601 timestamp (included)."
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
    "getSpaceflightArticleById": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "A unique integer value identifying this article."
                    }
                },
                "required": [
                    "id"
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
    "listSpaceflightBlogs": {
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
                    "event": {
                        "type": "array",
                        "items": {
                            "type": "integer"
                        },
                        "description": "Search for all documents related to a specific event using its Launch Library 2 ID."
                    },
                    "has_event": {
                        "type": "boolean",
                        "description": "Get all documents that have a related event."
                    },
                    "has_launch": {
                        "type": "boolean",
                        "description": "Get all documents that have a related launch."
                    },
                    "is_featured": {
                        "type": "boolean",
                        "description": "Get all documents that are featured."
                    },
                    "launch": {
                        "type": "array",
                        "items": {
                            "format": "uuid",
                            "type": "string"
                        },
                        "description": "Search for all documents related to a specific launch using its Launch Library 2 ID."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of results to return per page."
                    },
                    "news_site": {
                        "type": "string",
                        "description": "Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive."
                    },
                    "news_site_exclude": {
                        "type": "string",
                        "description": "Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive."
                    },
                    "offset": {
                        "type": "integer",
                        "description": "The initial index from which to return the results."
                    },
                    "ordering": {
                        "type": "array",
                        "items": {
                            "enum": [
                                "-published_at",
                                "-updated_at",
                                "published_at",
                                "updated_at"
                            ],
                            "type": "string"
                        },
                        "description": "Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)"
                    },
                    "published_at_gt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published after a given ISO8601 timestamp (excluded)."
                    },
                    "published_at_gte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published after a given ISO8601 timestamp (included)."
                    },
                    "published_at_lt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published before a given ISO8601 timestamp (excluded)."
                    },
                    "published_at_lte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published before a given ISO8601 timestamp (included)."
                    },
                    "search": {
                        "type": "string",
                        "description": "Search for documents with a specific phrase in the title or summary."
                    },
                    "summary_contains": {
                        "type": "string",
                        "description": "Search for all documents with a specific phrase in the summary."
                    },
                    "summary_contains_all": {
                        "type": "string",
                        "description": "Search for documents with a summary containing all keywords from comma-separated values."
                    },
                    "summary_contains_one": {
                        "type": "string",
                        "description": "Search for documents with a summary containing at least one keyword from comma-separated values."
                    },
                    "title_contains": {
                        "type": "string",
                        "description": "Search for all documents with a specific phrase in the title."
                    },
                    "title_contains_all": {
                        "type": "string",
                        "description": "Search for documents with a title containing all keywords from comma-separated values."
                    },
                    "title_contains_one": {
                        "type": "string",
                        "description": "Search for documents with a title containing at least one keyword from comma-separated values."
                    },
                    "updated_at_gt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated after a given ISO8601 timestamp (excluded)."
                    },
                    "updated_at_gte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated after a given ISO8601 timestamp (included)."
                    },
                    "updated_at_lt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated before a given ISO8601 timestamp (excluded)."
                    },
                    "updated_at_lte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated before a given ISO8601 timestamp (included)."
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
    "getSpaceflightBlogById": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "A unique integer value identifying this blog."
                    }
                },
                "required": [
                    "id"
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
    "listSpaceflightReports": {
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
                    "limit": {
                        "type": "integer",
                        "description": "Number of results to return per page."
                    },
                    "news_site": {
                        "type": "string",
                        "description": "Search for documents with a news_site__name present in a list of comma-separated values. Case insensitive."
                    },
                    "news_site_exclude": {
                        "type": "string",
                        "description": "Search for documents with a news_site__name not present in a list of comma-separated values. Case insensitive."
                    },
                    "offset": {
                        "type": "integer",
                        "description": "The initial index from which to return the results."
                    },
                    "ordering": {
                        "type": "array",
                        "items": {
                            "enum": [
                                "-published_at",
                                "-updated_at",
                                "published_at",
                                "updated_at"
                            ],
                            "type": "string"
                        },
                        "description": "Order the result on `published_at, -published_at, updated_at, -updated_at`.\n\n* `published_at` - Published at\n* `-published_at` - Published at (descending)\n* `updated_at` - Updated at\n* `-updated_at` - Updated at (descending)"
                    },
                    "published_at_gt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published after a given ISO8601 timestamp (excluded)."
                    },
                    "published_at_gte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published after a given ISO8601 timestamp (included)."
                    },
                    "published_at_lt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published before a given ISO8601 timestamp (excluded)."
                    },
                    "published_at_lte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents published before a given ISO8601 timestamp (included)."
                    },
                    "search": {
                        "type": "string",
                        "description": "Search for documents with a specific phrase in the title or summary."
                    },
                    "summary_contains": {
                        "type": "string",
                        "description": "Search for all documents with a specific phrase in the summary."
                    },
                    "summary_contains_all": {
                        "type": "string",
                        "description": "Search for documents with a summary containing all keywords from comma-separated values."
                    },
                    "summary_contains_one": {
                        "type": "string",
                        "description": "Search for documents with a summary containing at least one keyword from comma-separated values."
                    },
                    "title_contains": {
                        "type": "string",
                        "description": "Search for all documents with a specific phrase in the title."
                    },
                    "title_contains_all": {
                        "type": "string",
                        "description": "Search for documents with a title containing all keywords from comma-separated values."
                    },
                    "title_contains_one": {
                        "type": "string",
                        "description": "Search for documents with a title containing at least one keyword from comma-separated values."
                    },
                    "updated_at_gt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated after a given ISO8601 timestamp (excluded)."
                    },
                    "updated_at_gte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated after a given ISO8601 timestamp (included)."
                    },
                    "updated_at_lt": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated before a given ISO8601 timestamp (excluded)."
                    },
                    "updated_at_lte": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Get all documents updated before a given ISO8601 timestamp (included)."
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
    "getSpaceflightReportById": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "A unique integer value identifying this report."
                    }
                },
                "required": [
                    "id"
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
    "getSpaceflightInfo": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
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
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    }
};

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


export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const effectiveBaseUrl = options.baseUrl ?? baseUrl;
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
