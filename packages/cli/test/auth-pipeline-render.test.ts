import { describe, expect, test } from 'vitest';
import { renderInvokeAuthPipeline } from '../src/codegen/auth-pipeline-render.js';

describe('renderInvokeAuthPipeline', () => {
    test('public prepare calls prepareToolCall(optionsResolved) without credential preamble', () => {
        const pipeline = renderInvokeAuthPipeline('full', false, {
            checkToolAccess: false,
            prepareToolCall: true
        });
        expect(pipeline).toContain('prepareToolCall(optionsResolved));');
        expect(pipeline).not.toContain('ModuleCredentials');
        expect(pipeline).not.toContain('toModuleCredentials');
    });

    test('protected prepare calls prepareToolCall(optionsResolved, credential)', () => {
        const pipeline = renderInvokeAuthPipeline('full', true, {
            checkToolAccess: false,
            prepareToolCall: true
        });
        expect(pipeline).toContain('prepareToolCall(optionsResolved, credential)');
        expect(pipeline).toContain('prepareToolCall requires credential');
    });

    test('hooks-only module omits authCredential when auth is disabled', () => {
        const pipeline = renderInvokeAuthPipeline(
            'full',
            false,
            { checkToolAccess: false, prepareToolCall: true },
            false
        );
        expect(pipeline).not.toContain('authCredential');
    });
});
