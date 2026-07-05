import { describe, expect, it } from 'vitest';
import { buildInputZodBlock, emitInputZodByToolExport, emitZodExpression } from '@toolfactory.dev/core/codegen';
import type { JsonSchemaDict } from '../src/openapi-tool-codegen.js';
// Vitest: run via `npm run test --workspace packages/cli`

describe('json-schema-to-zod-codegen', () => {
    it('emits object with optional fields and strict', () => {
        const schema: JsonSchemaDict = {
            type: 'object',
            properties: {
                query: { type: 'string' }
            },
            required: [],
            additionalProperties: false
        };
        expect(emitZodExpression(schema)).toBe('z.object({ "query": z.string().optional() }).strict()');
    });

    it('emits string enum as union of literals', () => {
        const schema: JsonSchemaDict = {
            type: 'string',
            enum: ['a', 'b']
        };
        expect(emitZodExpression(schema)).toBe('z.union([z.literal("a"), z.literal("b")])');
    });

    it('emits number fields as union with string for LLM tool callers', () => {
        expect(emitZodExpression({ type: 'number' })).toBe('z.union([z.number(), z.string()])');
    });

    it('emits inputZodByTool export', () => {
        const out = emitInputZodByToolExport({
            demo: { type: 'object', properties: {}, additionalProperties: true }
        });
        expect(out).toContain('export const inputZodByTool');
        expect(out).toContain('"demo"');
    });

    it('omits zod import when there are no tool schemas', () => {
        const out = buildInputZodBlock({});
        expect(out).toContain('export const inputZodByTool');
        expect(out).not.toContain("import * as z from 'zod/v4'");
    });
});
