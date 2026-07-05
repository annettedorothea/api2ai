import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { loadOpenApi, makeOperationLookupKey } from '../src/openapi.js';

const fixtureDir = path.resolve(process.cwd(), 'test/fixtures');

describe('loadOpenApi', () => {
    test('dereferences request body $ref from components', async () => {
        const loaded = await loadOpenApi('./deref-body-ref.openapi.yaml', fixtureDir);
        const operation = loaded.operations.get(makeOperationLookupKey('POST', '/items'));
        expect(operation).toBeDefined();
        const schema = operation?.requestBody?.schema;
        expect(schema?.$ref).toBeUndefined();
        expect(schema?.type).toBe('object');
        expect(schema?.properties?.title?.type).toBe('string');
        expect(schema?.required).toEqual(['title']);
    });
});
