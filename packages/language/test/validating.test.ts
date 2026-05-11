import path from 'node:path';
import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { parseHelper, type ParseHelperOptions } from 'langium/test';
import { beforeAll, describe, expect, test } from 'vitest';
import { createApi2AiDslServices } from '../src/api-2-ai-dsl-module.js';
import type { Model } from '../src/generated/ast.js';

let parse: ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;
let caseIndex = 0;

const fixtureDir = path.resolve(process.cwd(), 'test/fixtures');

beforeAll(async () => {
    const services = createApi2AiDslServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Api2AiDsl);
});

function parseValidated(input: string) {
    caseIndex += 1;
    const documentUri = path.join(fixtureDir, `case-${caseIndex}.api2ai`);
    const options: ParseHelperOptions = { validation: true, documentUri };
    return parse(input, options);
}

describe('Validating', () => {
    test('accepts an operation that exists in referenced OpenAPI 3.x', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                toolName: "getPetById"
                intent: "get one pet"
            }
        `);

        expect(document.diagnostics ?? []).toHaveLength(0);
    });

    test('accepts api key auth metadata without secret values', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            auth apiKey {
                in: header
                name: "Authorization"
                env: "PETSTORE_TOKEN"
                prefix: "Bearer "
            }
            GET "/pet/{petId}" {
                toolName: "getPetById"
                intent: "get one pet"
            }
        `);

        expect(document.diagnostics ?? []).toHaveLength(0);
    });

    test('reports an error for empty auth env names', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            auth apiKey {
                in: header
                name: "Authorization"
                env: ""
            }
            GET "/pet/{petId}" {
                toolName: "getPetById"
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('auth apiKey env must not be empty'))).toBe(true);
    });

    test('does not report OpenAPI existence for an incomplete operation before the path string', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET 
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('does not exist in the referenced OpenAPI 3.x spec'))).toBe(
            false
        );
    });

    test('reports an error for unknown method+path', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            DELETE "/customers" {
                toolName: "deleteCustomer"
                intent: "delete customer"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('does not exist in the referenced OpenAPI 3.x spec'))).toBe(true);
    });

    test('reports an error for duplicate tool names', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                toolName: "petTool"
                intent: "first"
            }
            POST "/pet" {
                toolName: "petTool"
                intent: "second"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('must be unique'))).toBe(true);
    });

    test('reports an error when two tool names differ only by surrounding whitespace', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                toolName: "petTool"
                intent: "first"
            }
            POST "/pet" {
                toolName: "  petTool  "
                intent: "second"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('toolName "petTool" must be unique'))).toBe(true);
    });

    test('reports an error for non OpenAPI 3.x specs', async () => {
        document = await parseValidated(`
            openapi "./swagger2.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                toolName: "getPetById"
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('Cannot load OpenAPI document'))).toBe(true);
    });

    test('reports unsupported style/explode serialization as DSL error', async () => {
        document = await parseValidated(`
            openapi "./unsupported-style.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pets" {
                toolName: "listPets"
                intent: "list pets by filter object"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('supports query style "form" only'))).toBe(true);
    });

    test('reports cookie parameters as unsupported for generated invoke', async () => {
        document = await parseValidated(`
            openapi "./cookie-param.openapi.yaml"
            baseUrl "https://example.com"
            GET "/session" {
                toolName: "getSession"
                intent: "get session"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('cookie parameters are not supported'))).toBe(true);
    });

    test('reports operation missing required toolName', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('Operation requires `toolName'))).toBe(true);
    });

    test('reports operation missing required intent', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                toolName: "getPetById"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('Operation requires `intent'))).toBe(true);
    });

    test('reports auth apiKey missing required in/name/env', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            auth apiKey {
                prefix: "Bearer "
            }
            GET "/pet/{petId}" {
                toolName: "getPetById"
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('auth apiKey requires `in'))).toBe(true);
        expect(diagnostics.some((d) => d.message.includes('auth apiKey requires `name'))).toBe(true);
        expect(diagnostics.some((d) => d.message.includes('auth apiKey requires `env'))).toBe(true);
    });

    test('reports duplicate key inside operation block', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                toolName: "getPetById"
                intent: "get one pet"
                toolName: "secondName"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('Duplicate key "toolName"'))).toBe(true);
    });

    test('reports duplicate key inside auth block', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            auth apiKey {
                in: header
                name: "Authorization"
                env: "MY_TOKEN"
                env: "OTHER_TOKEN"
            }
            GET "/pet/{petId}" {
                toolName: "getPetById"
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('Duplicate key "env"'))).toBe(true);
    });

    test('accepts an operation with properties in shuffled order', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                description: "details"
                summary: "the title"
                intent: "get one pet"
                toolName: "getPetById"
            }
        `);

        expect(document.diagnostics ?? []).toHaveLength(0);
    });
});
