import { describe, expect, test } from 'vitest';
import type { OpenApiOperationDetails, Operation } from 'api-2-ai-dsl-language';
import { buildMcpDescription, buildToolInputSchema, effectiveResponse } from '../src/openapi-tool-codegen.js';

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
            'demo-tools',
            'api2ai'
        );
        expect(description).toContain('Request body:\nRequired: title. Optional: status.');
        expect(description).not.toContain('OpenAPI body hint');
    });

    test('includes Parameters section with path and query params and DSL patches', () => {
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
            'demo-tools',
            'api2ai'
        );
        expect(description).toContain('Parameters:\n- todoId (path): Todo id from listTodos. (example: t-1)');
        expect(description).toContain('- status (query)');
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
    });

    test('applies DSL params description patch to query property schema', () => {
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
        const query = (schema.properties as Record<string, Record<string, unknown>>).query as {
            properties: Record<string, Record<string, unknown>>;
        };
        expect(query.properties.page.description).toBe('1-based page index for the agent.');
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
        const query = (schema.properties as Record<string, Record<string, unknown>>).query as {
            properties: Record<string, Record<string, unknown>>;
        };
        expect(query.properties.page.examples).toEqual([2]);
    });
});
