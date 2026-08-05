import { describe, expect, test } from 'vitest';
import { renderInvokePipeline } from '../src/codegen/invoke-pipeline-render.js';

describe('renderInvokePipeline', () => {
    test('public prepare calls prepareToolCall(optionsResolved) without credential preamble', () => {
        const pipeline = renderInvokePipeline('full', false, {
            checkToolAccess: false,
            prepareToolCall: true,
            afterToolCall: false
        });
        expect(pipeline).toContain('prepareToolCall(optionsResolved));');
        expect(pipeline).not.toContain('ModuleCredentials');
        expect(pipeline).not.toContain('toModuleCredentials');
    });

    test('protected prepare calls prepareToolCall(optionsResolved, credential)', () => {
        const pipeline = renderInvokePipeline('full', true, {
            checkToolAccess: false,
            prepareToolCall: true,
            afterToolCall: false
        });
        expect(pipeline).toContain('prepareToolCall(optionsResolved, credential)');
        expect(pipeline).toContain('prepareToolCall requires credential');
    });

    test('hooks-only module omits authCredential when auth is disabled', () => {
        const pipeline = renderInvokePipeline(
            'full',
            false,
            { checkToolAccess: false, prepareToolCall: true, afterToolCall: false },
            false
        );
        expect(pipeline).not.toContain('authCredential');
    });
});
