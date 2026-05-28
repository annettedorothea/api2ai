import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const nodeGlobals = {
    AbortController: 'readonly',
    Buffer: 'readonly',
    URL: 'readonly',
    __dirname: 'readonly',
    clearTimeout: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    globalThis: 'readonly',
    process: 'readonly',
    setTimeout: 'readonly',
    TextDecoder: 'readonly',
    TextEncoder: 'readonly'
};

export default [
    {
        ignores: [
            '**/node_modules/**',
            '**/out/**',
            '**/dist/**',
            '**/coverage/**',
            '**/*.tsbuildinfo',
            '**/syntaxes/**',
            'packages/cli/resources/mcp-serve-emitted.mjs',
            'packages/cli/tmp/**',
            'packages/extension/demos/tmp/**',
            'packages/extension/demos/.pagila-src/**'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: nodeGlobals
        }
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ]
        }
    },
    {
        files: ['**/src/generated/**/*.{ts,js}'],
        linterOptions: {
            reportUnusedDisableDirectives: false
        }
    },
    {
        files: ['packages/extension/demos/generated/**/*.mjs', '**/src/generated/**/*.js'],
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ]
        }
    }
];
