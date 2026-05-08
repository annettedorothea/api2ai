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
                intent: "get one pet"
                toolName: "getPetById"
            }
        `);

        expect(document.diagnostics ?? []).toHaveLength(0);
    });

    test('reports an error for unknown method+path', async () => {
        document = await parseValidated(`
            openapi "./petstore-mini.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            DELETE "/customers" {
                intent: "delete customer"
                toolName: "deleteCustomer"
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
                intent: "first"
                toolName: "petTool"
            }
            POST "/pet" {
                intent: "second"
                toolName: "petTool"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('must be unique'))).toBe(true);
    });

    test('reports an error for non OpenAPI 3.x specs', async () => {
        document = await parseValidated(`
            openapi "./swagger2.openapi.yaml"
            baseUrl "https://petstore3.swagger.io/api/v3"
            GET "/pet/{petId}" {
                intent: "get one pet"
                toolName: "getPetById"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some(d => d.message.includes('Cannot load OpenAPI document'))).toBe(true);
    });
});
