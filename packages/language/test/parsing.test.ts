import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { parseHelper } from 'langium/test';
import { beforeAll, describe, expect, test } from 'vitest';
import { createApi2AiDslServices } from '../src/api-2-ai-dsl-module.js';
import { getAccessKind, getOptionalParams } from '../src/operation-access.js';
import { isCheckedAccess, isPublicAccess } from '../src/generated/ast.js';
import type { Model } from '../src/generated/ast.js';

let parse: ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    const services = createApi2AiDslServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Api2AiDsl);
});

describe('Parsing tests', () => {
    test('parses minimal api2ai model with one operation', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/customers" {
                toolName: getAllCustomers
                access: public
                intent: "get all customers"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.parseResult.value.openapi).toBe('./langium-test-mini.openapi.yaml');
        expect(document.parseResult.value.operations).toHaveLength(1);
        expect(document.parseResult.value.operations[0].method).toBe('GET');
        expect(document.parseResult.value.operations[0].path).toBe('/customers');
        expect(document.parseResult.value.operations[0].toolName).toBe('getAllCustomers');
        expect(getAccessKind(document.parseResult.value.operations[0])).toBe('public');
    });

    test('parses multiline intent and description on operation', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/customers" {
                toolName: listCustomers
                access: public
                intent: '''
                    List customers for support.
                    Read-only.
                '''
                summary: "Customer list"
                description: '''
                    Returns all customers.
                    Paginated via query params in OpenAPI.
                '''
                example: '''
                    List first page
                '''
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        const op = document.parseResult.value.operations[0];
        expect(op.intent).toContain('support');
        expect(op.intent).toContain('\n');
        expect(op.description).toContain('Paginated');
        expect(op.description).toContain('\n');
        expect(op.example).toContain('first page');
    });

    test('parses operation with optional overrides', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/customers" {
                toolName: listCustomers
                access: public
                intent: "list"
                summary: "Custom summary override"
                description: ""
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        const op = document.parseResult.value.operations[0];
        expect(op.summary).toBe('Custom summary override');
        expect(op.description).toBe('');
    });

    test('parses response and body on operation', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            POST "/pet" {
                toolName: addPet
                access: public
                intent: "add pet"
                body: '''
                    Required: name, photoUrls.
                    Optional: status.
                '''
                response: "Returns created pet with id"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        const op = document.parseResult.value.operations[0];
        expect(op.response).toContain('created pet');
        expect(op.body).toContain('photoUrls');
    });

    test('rejects legacy `title:` field that has been removed from the DSL', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/customers" {
                toolName: listCustomers
                access: public
                intent: "list"
                title: "Legacy title"
            }
        `);

        expect(document.parseResult.parserErrors.length).toBeGreaterThan(0);
    });

    test('rejects operation properties outside the canonical order', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/customers" {
                toolName: listCustomers
                intent: "list"
                access: public
            }
        `);

        expect(document.parseResult.parserErrors.length).toBeGreaterThan(0);
    });

    test('rejects auth properties outside the canonical order', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            auth {
                prefix: "Bearer "
                name: "Authorization"
                in: header
            }
            GET "/customers" {
                toolName: listCustomers
                access: protected
                intent: "list"
            }
        `);

        expect(document.parseResult.parserErrors.length).toBeGreaterThan(0);
    });

    test('parses checked access on operation', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            auth {
                in: header
                name: "Authorization"
            }
            GET "/orders" {
                toolName: listOrders
                access: checked
                intent: "list"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(getAccessKind(document.parseResult.value.operations[0])).toBe('checked');
    });

    test('parses public access on operation', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            POST "/login/{id}" {
                toolName: login
                access: public
                intent: "login"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(isPublicAccess(document.parseResult.value.operations[0].access)).toBe(true);
    });

    test('parses optionalParams inside checked access', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/customers/{id}" {
                toolName: getCustomer
                access: checked {
                    optionalParams: [id]
                }
                intent: "get customer"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        const op = document.parseResult.value.operations[0];
        expect(isCheckedAccess(op.access)).toBe(true);
        expect(getOptionalParams(op)).toEqual(['id']);
    });

    test('parses params with description and example on operation', async () => {
        document = await parse(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                intent: "get one pet"
                params: {
                    petId: {
                        description: "Pet id from listPets."
                        example: "42"
                    }
                }
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        const op = document.parseResult.value.operations[0];
        expect(op.params?.entries).toHaveLength(1);
        expect(op.params?.entries[0]?.key).toBe('petId');
    });
});
