import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createApi2AiDslServices } from 'api-2-ai-dsl-language';
import type { Model } from 'api-2-ai-dsl-language';
import { collectLangiumDocumentErrors } from '@core2ai/core/codegen';
import { describe, expect, test } from 'vitest';

describe('generate validation gate', () => {
    test('reports duplicate toolName as blocking error', async () => {
        const services = createApi2AiDslServices(EmptyFileSystem);
        const parse = parseHelper<Model>(services.Api2AiDsl);
        const document = await parse(
            `
openapi "./langium-test-mini.openapi.yaml"

GET "/pet/{petId}" {
    toolName: petTool
    access: public
    intent: "get pet"
}
GET "/pets" {
    toolName: petTool
    access: public
    intent: "list pets"
}
`,
            { validation: true }
        );

        const errors = collectLangiumDocumentErrors(document);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.message.includes('must be unique'))).toBe(true);
    });
});
