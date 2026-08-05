import { describe, expect, test } from 'vitest';
import type { OpenApiOperationDetails, Operation } from 'api-2-ai-dsl-language';
import {
    buildMcpDescription,
    buildInvokeParamBuckets,
    buildInvokeParameterDescriptionSection,
    buildQueryParamWireNamesLookup,
    buildPathParamWireNamesLookup,
    buildHeaderParamWireNamesLookup,
    buildToolInputSchema,
    effectiveResponse,
    flattenLegacyInvokeDescription,
    buildFlatCallShapeSection
} from '../src/openapi-tool-codegen.js';

function minimalOperation(overrides: Partial<Operation> = {}): Operation {
    return {
        method: 'GET',
        path: '/items',
        toolName: 'listItems',
        access: { $type: 'PublicAccess' },
        intent: 'list items',
        ...overrides
    } as Operation;
}

const sampleDetails: OpenApiOperationDetails = {
    summary: 'List items',
    description: 'Returns items',
    operationId: 'list-items',
    tags: ['Items'],
    parameters: [
        {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer' }
        }
    ],
    requestBody: {
        description: 'OpenAPI body hint',
        required: true,
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' }
            },
            required: ['title']
        }
    },
    responses: [
        {
            statusCode: '200',
            description: 'OK',
            schema: {
                type: 'object',
                properties: { items: { type: 'array' } }
            }
        },
        {
            statusCode: '400',
            description: 'Bad Request'
        }
    ]
};

describe('effectiveResponse', () => {
    test('falls back to OpenAPI response section when DSL response is unset', () => {
        const text = effectiveResponse(minimalOperation(), sampleDetails);
        expect(text).toContain('HTTP 200');
        expect(text).toContain('items');
        expect(text).toContain('Documented errors:');
    });

    test('DSL response replaces OpenAPI block', () => {
        const text = effectiveResponse(
            minimalOperation({ response: 'Returns items[] with id and title only.' }),
            sampleDetails
        );
        expect(text).toBe('Returns items[] with id and title only.');
        expect(text).not.toContain('HTTP 200');
    });

    test('empty DSL response suppresses section', () => {
        expect(effectiveResponse(minimalOperation({ response: '' }), sampleDetails)).toBeUndefined();
    });
});

describe('buildMcpDescription', () => {
    test('uses DSL body description instead of OpenAPI requestBody text', () => {
        const description = buildMcpDescription(
            minimalOperation({
                method: 'POST',
                body: 'Required: title. Optional: status.'
            }),
            sampleDetails,
            undefined,
            'demo-tools'
        );
        expect(description).toContain('Request body:\nRequired: title. Optional: status.');
        expect(description).not.toContain('OpenAPI body hint');
    });

    test('omits Parameters prose section (inputSchema carries param descriptions)', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'todoId',
                    in: 'path',
                    required: true,
                    description: 'OpenAPI path id'
                },
                {
                    name: 'status',
                    in: 'query',
                    required: false,
                    schema: { type: 'string', enum: ['open', 'done'] }
                }
            ]
        };
        const description = buildMcpDescription(
            minimalOperation({
                method: 'GET',
                path: '/todos/{todoId}',
                toolName: 'getTodo',
                params: {
                    $type: 'ApiParamMap',
                    entries: [
                        {
                            $type: 'ApiParamEntry',
                            key: 'todoId',
                            spec: {
                                $type: 'ApiParamSpec',
                                fields: [
                                    {
                                        $type: 'ApiParamSpecField',
                                        description: 'Todo id from listTodos.'
                                    },
                                    {
                                        $type: 'ApiParamSpecField',
                                        example: 't-1'
                                    }
                                ]
                            }
                        }
                    ]
                }
            } as Partial<Operation>),
            details,
            undefined,
            'demo-tools'
        );
        expect(description).not.toContain('Parameters:');
        expect(description).toContain('Intent:');
    });
});

describe('buildToolInputSchema', () => {
    test('applies DSL body description to body schema root', () => {
        const schema = buildToolInputSchema(
            sampleDetails,
            [],
            minimalOperation({ method: 'POST', body: 'Send title in JSON body.' })
        );
        const body = (schema.properties as Record<string, Record<string, unknown>>).body;
        expect(body.description).toBe('Send title in JSON body.');
        expect(body.properties).toBeDefined();
        expect(schema.properties).not.toHaveProperty('query');
    });

    test('places OpenAPI query params at schema root for LLM-friendly flat args', () => {
        const schema = buildToolInputSchema(sampleDetails, []);
        const props = schema.properties as Record<string, Record<string, unknown>>;
        expect(props.page).toBeDefined();
        expect(props.page.type).toBe('integer');
        expect(schema.properties).not.toHaveProperty('pathParams');
        expect(schema.properties).not.toHaveProperty('query');
    });

    test('buildInvokeParamBuckets groups parameter names by invoke bucket', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'todoId',
                    in: 'path',
                    required: true
                },
                {
                    name: 'status',
                    in: 'query',
                    required: false,
                    schema: { type: 'string' }
                }
            ]
        };
        expect(buildInvokeParamBuckets(details)).toEqual({
            pathParams: ['todoId'],
            query: ['status'],
            headers: [],
            arrayQuery: []
        });
    });

    test('buildInvokeParamBuckets lists array query parameter names', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'hourly',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'array',
                        items: { type: 'string', enum: ['temperature_2m'] }
                    }
                }
            ]
        };
        expect(buildInvokeParamBuckets(details).arrayQuery).toEqual(['hourly']);
    });

    test('applies DSL params description patch to flat query property schema', () => {
        const schema = buildToolInputSchema(
            sampleDetails,
            [],
            minimalOperation({
                params: {
                    $type: 'ApiParamMap',
                    entries: [
                        {
                            $type: 'ApiParamEntry',
                            key: 'page',
                            spec: {
                                $type: 'ApiParamSpec',
                                fields: [
                                    {
                                        $type: 'ApiParamSpecField',
                                        description: '1-based page index for the agent.'
                                    }
                                ]
                            }
                        }
                    ]
                }
            } as Partial<Operation>)
        );
        const props = schema.properties as Record<string, Record<string, unknown>>;
        expect(props.page.description).toBe('1-based page index for the agent. (type: integer)');
    });

    test('applies DSL params example patch using OpenAPI parameter type', () => {
        const schema = buildToolInputSchema(
            sampleDetails,
            [],
            minimalOperation({
                params: {
                    $type: 'ApiParamMap',
                    entries: [
                        {
                            $type: 'ApiParamEntry',
                            key: 'page',
                            spec: {
                                $type: 'ApiParamSpec',
                                fields: [
                                    {
                                        $type: 'ApiParamSpecField',
                                        example: '2'
                                    }
                                ]
                            }
                        }
                    ]
                }
            } as Partial<Operation>)
        );
        const props = schema.properties as Record<string, Record<string, unknown>>;
        expect(props.page.examples).toEqual([2]);
    });

    test('flattenLegacyInvokeDescription rewrites pathParams and query bucket wording', () => {
        expect(flattenLegacyInvokeDescription('pathParams.todoId required; query.status optional')).toBe(
            'todoId required; status optional'
        );
        expect(flattenLegacyInvokeDescription('pathParams: { "todoId": "t-1" }')).toBe('{ "todoId": "t-1" }');
    });

    test('buildFlatCallShapeSection documents flat MCP arguments', () => {
        const section = buildFlatCallShapeSection(minimalOperation(), sampleDetails);
        expect(section).toContain('page');
        expect(section).toContain('top-level tool arguments');
        expect(section).toContain('Do not nest');
    });

    test('buildToolInputSchema uses MCP-safe names for dotted query parameters', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'vote_average.gte',
                    in: 'query',
                    required: false,
                    schema: { type: 'number' }
                },
                {
                    name: 'page',
                    in: 'query',
                    required: false,
                    schema: { type: 'integer' }
                }
            ]
        };
        const schema = buildToolInputSchema(details);
        const props = schema.properties as Record<string, unknown>;
        expect(props).toHaveProperty('vote_average_gte');
        expect(props).toHaveProperty('page');
        expect(props).not.toHaveProperty('vote_average.gte');
    });

    test('buildInvokeParamBuckets uses MCP-safe query names', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'primary_release_date.gte',
                    in: 'query',
                    required: false,
                    schema: { type: 'string' }
                }
            ]
        };
        expect(buildInvokeParamBuckets(details).query).toEqual(['primary_release_date_gte']);
    });

    test('buildQueryParamWireNamesLookup maps MCP names back to wire names', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'vote_count.lte',
                    in: 'query',
                    required: false,
                    schema: { type: 'number' }
                },
                {
                    name: 'page',
                    in: 'query',
                    required: false,
                    schema: { type: 'integer' }
                }
            ]
        };
        expect(buildQueryParamWireNamesLookup(details)).toEqual({
            vote_count_lte: 'vote_count.lte'
        });
    });

    test('buildPathParamWireNamesLookup maps MCP names back to wire names', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'account.id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                }
            ]
        };
        expect(buildPathParamWireNamesLookup(details)).toEqual({
            account_id: 'account.id'
        });
    });

    test('buildHeaderParamWireNamesLookup maps MCP names back to wire names', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'X-Trace-Id',
                    in: 'header',
                    required: true,
                    schema: { type: 'string' }
                }
            ]
        };
        expect(buildHeaderParamWireNamesLookup(details)).toEqual({
            X_Trace_Id: 'X-Trace-Id'
        });
    });

    test('buildInvokeParameterDescriptionSection omits wire hints and sanitizes dotted names in prose', () => {
        const details: OpenApiOperationDetails = {
            ...sampleDetails,
            parameters: [
                {
                    name: 'vote_average.gte',
                    in: 'query',
                    required: false,
                    schema: { type: 'number' }
                },
                {
                    name: 'certification_country',
                    in: 'query',
                    required: false,
                    description:
                        'use in conjunction with the `certification`, `certification.gte` and `certification.lte` filters'
                }
            ]
        };
        const text = buildInvokeParameterDescriptionSection(minimalOperation(), details);
        expect(text).toContain('- vote_average_gte (query)');
        expect(text).not.toContain('(wire:');
        expect(text).not.toContain('certification.gte');
        expect(text).toContain('certification_gte');
    });
});
