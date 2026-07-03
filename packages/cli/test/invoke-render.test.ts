import { describe, expect, test } from 'vitest';
import { createSharedInvokeBlock } from '../src/generator/invoke-render.js';

describe('invoke-render', () => {
    test('emits TRACE fallback because fetch rejects that method', () => {
        const block = createSharedInvokeBlock('{}', '{}', '{}', 'none', 'none', {
            authorizers: false,
            preparers: false
        });
        expect(block).toContain('performToolHttpRequest');
        expect(block).toContain("init.method !== 'TRACE'");
        expect(block).toContain('await performToolHttpRequest(url');
    });
});
