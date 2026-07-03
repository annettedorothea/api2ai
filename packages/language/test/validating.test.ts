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
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                intent: "get one pet"
            }
        `);

        expect(document.diagnostics ?? []).toHaveLength(0);
    });

    test('accepts auth metadata without secret values', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            auth {
                in: header
                name: "Authorization"
                prefix: "Bearer "
            }
            GET "/pet/{petId}" {
                toolName: getPetById
                access: protected
                intent: "get one pet"
            }
        `);

        expect(document.diagnostics ?? []).toHaveLength(0);
    });

    test('warns when auth block has no protected operations', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            auth {
                in: header
                name: "Authorization"
            }
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('auth block has no effect'))).toBe(true);
    });

    test('reports an error for empty auth name', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            auth {
                in: header
                name: ""
            }
            GET "/pet/{petId}" {
                toolName: getPetById
                access: protected
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('auth name must not be empty'))).toBe(true);
    });

    test('does not report OpenAPI existence for an incomplete operation before the path string', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET 
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('does not exist in the referenced OpenAPI 3.x spec'))).toBe(
            false
        );
    });

    test('reports an error for unknown method+path', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            DELETE "/customers" {
                toolName: deleteCustomer
                access: public
                intent: "delete customer"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('does not exist in the referenced OpenAPI 3.x spec'))).toBe(
            true
        );
    });

    test('reports an error for duplicate tool names', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: petTool
                access: public
                intent: "first"
            }
            POST "/pet" {
                toolName: petTool
                access: public
                intent: "second"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('must be unique'))).toBe(true);
    });

    test('reports an error when two tool names differ only by surrounding whitespace', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: petTool
                access: public
                intent: "first"
            }
            POST "/pet" {
                toolName:   petTool  
                access: public
                intent: "second"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('toolName "petTool" must be unique'))).toBe(true);
    });

    test('reports an error for non OpenAPI 3.x specs', async () => {
        document = await parseValidated(`
            openapi "./swagger2.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('Cannot load OpenAPI document'))).toBe(true);
    });

    test('reports unsupported style/explode serialization as DSL error', async () => {
        document = await parseValidated(`
            openapi "./unsupported-style.openapi.yaml"
            GET "/pets" {
                toolName: listPets
                access: public
                intent: "list pets by filter object"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('supports query style "form" only'))).toBe(true);
    });

    test('reports cookie parameters as unsupported for generated invoke', async () => {
        document = await parseValidated(`
            openapi "./cookie-param.openapi.yaml"
            GET "/session" {
                toolName: getSession
                access: public
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('cookie parameters are not supported'))).toBe(true);
    });

    test('reports operation missing required toolName', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                intent: "get one pet"
                access: public
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('Operation requires `toolName'))).toBe(true);
    });

    test('reports operation missing required intent', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('Operation requires `intent'))).toBe(true);
    });

    test('reports auth missing required in/name', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            auth {
                prefix: "Bearer "
            }
            GET "/pet/{petId}" {
                toolName: getPetById
                access: protected
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('auth requires `in: header`'))).toBe(true);
        expect(diagnostics.some((d) => d.message.includes('auth requires `name'))).toBe(true);
    });

    test('reports protected without auth block', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: protected
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('requires an auth block'))).toBe(true);
    });

    test('reports authorize on public access', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                authorize: true
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('authorize: true requires access `protected`'))).toBe(true);
    });

    test('accepts public with prepare without auth block', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                prepare: true
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics).toHaveLength(0);
    });

    test('accepts optionalParams when parameter exists and is required in OpenAPI', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                prepare: {
                    optionalParams: [petId]
                }
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics).toHaveLength(0);
    });

    test('warns when optionalParams entry is not in OpenAPI', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                prepare: {
                    optionalParams: [customerId]
                }
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.severity).toBe(2);
        expect(diagnostics[0]?.message).toContain('optionalParams entry "customerId"');
        expect(diagnostics[0]?.message).toContain('no effect on the generated tool schema');
    });

    test('warns only for unknown optionalParams entries when list is mixed', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                prepare: {
                    optionalParams: [petId, customerId]
                }
                intent: "get one pet"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.message).toContain('"customerId"');
        expect(diagnostics[0]?.message).not.toContain('"petId"');
    });

    test('warns when DSL body is set but OpenAPI has no requestBody', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                intent: "get one pet"
                body: "This operation has no body in OpenAPI."
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.severity).toBe(2);
        expect(diagnostics[0]?.message).toContain('DSL `body` is set but OpenAPI has no requestBody');
    });

    test('warns when params entry is not in OpenAPI', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                intent: "get one pet"
                params: {
                    customerId: {
                        description: "unknown param"
                    }
                }
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('params entry "customerId"'))).toBe(true);
    });

    test('warns when params example does not match OpenAPI integer schema', async () => {
        document = await parseValidated(`
            openapi "./langium-test-mini.openapi.yaml"
            GET "/pet/{petId}" {
                toolName: getPetById
                access: public
                intent: "get one pet"
                params: {
                    petId: {
                        description: "pet id"
                        example: "not-an-integer"
                    }
                }
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('integer'))).toBe(true);
    });

    test('reports header object parameter as unsupported serialization', async () => {
        document = await parseValidated(`
            openapi "./header-object.openapi.yaml"
            GET "/meta" {
                toolName: getMeta
                access: public
                intent: "get meta"
            }
        `);

        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics.some((d) => d.message.includes('object typed') && d.message.includes('header'))).toBe(true);
    });

    test('validates extension test harness demo without diagnostics', async () => {
        const demoPath = path.resolve(process.cwd(), '../extension/demos/test.api2ai');
        const content = await import('node:fs').then((fs) => fs.readFileSync(demoPath, 'utf8'));
        document = await parse(content, { validation: true, documentUri: demoPath });

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.diagnostics ?? []).toHaveLength(0);
    });

    test('validates extension bookings demo without diagnostics', async () => {
        const demoPath = path.resolve(process.cwd(), '../extension/demos/bookings.api2ai');
        const content = await import('node:fs').then((fs) => fs.readFileSync(demoPath, 'utf8'));
        caseIndex += 1;
        document = await parse(content, { validation: true, documentUri: demoPath });

        expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(document.diagnostics ?? []).toHaveLength(0);
    });
});
