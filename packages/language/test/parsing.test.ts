import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { parseHelper } from 'langium/test';
import { beforeAll, describe, expect, test } from 'vitest';
import { createApi2AiDslServices } from '../src/api-2-ai-dsl-module.js';
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
            openapi "./petstore.openapi.yaml"
            GET "/customers" {
                toolName: "getAllCustomers"
                intent: "get all customers"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.parseResult.value.openapi).toBe('./petstore.openapi.yaml');
        expect(document.parseResult.value.operations).toHaveLength(1);
        expect(document.parseResult.value.operations[0].method).toBe('GET');
        expect(document.parseResult.value.operations[0].path).toBe('/customers');
        expect(document.parseResult.value.operations[0].toolName).toBe('getAllCustomers');
    });

    test('parses operation with optional overrides', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            GET "/customers" {
                toolName: "listCustomers"
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

    test('rejects legacy `title:` field that has been removed from the DSL', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            GET "/customers" {
                toolName: "listCustomers"
                intent: "list"
                title: "Legacy title"
            }
        `);

        expect(document.parseResult.parserErrors.length).toBeGreaterThan(0);
    });

    test('rejects operation properties outside the canonical order', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            GET "/customers" {
                description: "long text"
                summary: "the title"
                example: "Example call"
                intent: "list"
                toolName: "listCustomers"
            }
        `);

        expect(document.parseResult.parserErrors.length).toBeGreaterThan(0);
    });

    test('parses optional insecureEnv flag', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            insecureEnv
            GET "/customers" {
                toolName: "listCustomers"
                intent: "list"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.parseResult.value.insecureEnv).toBe(true);
    });

    test('rejects auth properties outside the canonical order', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            auth {
                prefix: "Bearer "
                name: "Authorization"
                in: header
            }
            GET "/customers" {
                toolName: "listCustomers"
                intent: "list"
            }
        `);

        expect(document.parseResult.parserErrors.length).toBeGreaterThan(0);
    });

    test('parses restricted flag on operation', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            auth {
                in: header
                name: "Authorization"
            }
            GET "/orders" {
                toolName: "listOrders"
                intent: "list"
                restricted
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.parseResult.value.operations[0].restricted).toBe(true);
    });

    test('parses public flag on operation', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            POST "/login/{id}" {
                toolName: "login"
                intent: "login"
                public
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.parseResult.value.operations[0].public).toBe(true);
    });

    test('parses autofillParams on operation', async () => {
        document = await parse(`
            openapi "./petstore.openapi.yaml"
            GET "/customers/{id}" {
                toolName: "getCustomer"
                intent: "get customer"
                autofillParams: ["id"]
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.parseResult.value.operations[0].autofillParams).toEqual(['id']);
    });
});
