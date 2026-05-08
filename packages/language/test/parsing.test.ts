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
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/customers" {
                intent: "get all customers"
                toolName: "getAllCustomers"
            }
        `);

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.parseResult.value.openapi).toBe('./petstore.openapi.yaml');
        expect(document.parseResult.value.baseUrl).toBe('https://petstore3.swagger.io/api/v3');
        expect(document.parseResult.value.operations).toHaveLength(1);
        expect(document.parseResult.value.operations[0].method).toBe('GET');
        expect(document.parseResult.value.operations[0].path).toBe('/customers');
        expect(document.parseResult.value.operations[0].toolName).toBe('getAllCustomers');
    });
});
