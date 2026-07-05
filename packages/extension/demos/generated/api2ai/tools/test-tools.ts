/**
 * Generated from: test.api2ai
 * Referenced OpenAPI: ./openapi/test.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/test-tools/verifyTestCredential.js';
import { checkToolAccessForTestGetAdminSecrets } from '../../../src/hooks/api2ai/test-tools/testGetAdminSecrets.js';
import { prepareToolCallForTestGetAdminSecrets } from '../../../src/hooks/api2ai/test-tools/testGetAdminSecrets.js';
import { prepareToolCallForTestListPublicPrepared } from '../../../src/hooks/api2ai/test-tools/testListPublicPrepared.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'testPing',
        title: 'Public ping',
        description:
            'Intent:\nHarness public GET ping\n\nMeta:\noperationId: test-ping\n\nExample:\nPing the test API\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): ok\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/ping',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testProtectedStatus',
        title: 'Protected status',
        description:
            'Intent:\nHarness protected route with query api_key\n\nMeta:\noperationId: test-protected-status\n\nExample:\nGet protected status\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): status\nDocumented errors:\nHTTP 401 — Unauthorized\n\nRuntime: protected — implement src/hooks/api2ai/test-tools/verifyTestCredential.ts; credential sent as query "api_key".',
        method: 'GET',
        path: '/protected/status',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testGetItem',
        title: 'Get item by id',
        description:
            'Intent:\nHarness path param itemId\n\nMCP arguments:\npass itemId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-get-item\n\nParameters:\n- itemId (path)\n\nExample:\nGet item item-1\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): itemId\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items/{itemId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testListItems',
        title: 'List items by tag',
        description:
            'Intent:\nHarness query params status (optional enum) and tag (required)\n\nMCP arguments:\npass status, tag as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-list-items\n\nParameters:\n- status (query): Optional filter open or done (example: open)\n- tag (query): Required category tag for the listing (example: harness)\n\nExample:\nList open items for tag harness\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): items\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testSearchItems',
        title: 'Search items by tags',
        description:
            'Intent:\nHarness query array tags\n\nMCP arguments:\npass tags as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-search-items\n\nParameters:\n- tags (query)\n\nExample:\nSearch tags alpha and beta\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): tags\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items/search',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testGetWithHeader',
        title: 'Get item with trace header',
        description:
            'Intent:\nHarness required header X-Trace-Id on upstream request\n\nMCP arguments:\npass X-Trace-Id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-get-with-header\n\nParameters:\n- X-Trace-Id (header)\n\nExample:\nCall with trace id trace-1\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): traceId\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items/with-header',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testCreateResource',
        title: 'Create harness resource',
        description:
            'Intent:\nHarness POST with inline body schema\n\nMCP arguments:\nsend the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nCreates a resource in the test API. Use for MCP write smoke.\n\nMeta:\noperationId: test-create-resource\n\nRequest body:\nRequired: name (string). Optional: note (string).\n\nExample:\nCreate resource MCPTEST-name\n\nResponse:\nHTTP 201 — id and name of the created resource.\n\nRuntime: public endpoint — no credential required.',
        method: 'POST',
        path: '/resources',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testPutResource',
        title: 'Replace resource',
        description:
            'Intent:\nHarness PUT with $ref body ResourceUpdate\n\nMCP arguments:\npass resourceId as top-level tool arguments; send the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-put-resource\n\nParameters:\n- resourceId (path)\n\nExample:\nPut resource res-1 name MCPTEST-updated\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): name, resourceId\n\nRuntime: public endpoint — no credential required.',
        method: 'PUT',
        path: '/resources/{resourceId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testPatchResource',
        title: 'Patch resource note',
        description:
            'Intent:\nHarness PATCH with $ref body ResourcePatch\n\nMCP arguments:\npass resourceId as top-level tool arguments; send the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-patch-resource\n\nParameters:\n- resourceId (path)\n\nExample:\nPatch resource res-1 note MCPTEST-note\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'PATCH',
        path: '/resources/{resourceId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testDeleteResource',
        title: 'Delete resource',
        description:
            'Intent:\nHarness DELETE without body\n\nMCP arguments:\npass resourceId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-delete-resource\n\nParameters:\n- resourceId (path)\n\nExample:\nDelete resource res-1\n\nResponse:\nHTTP 204\nNo content\n\nRuntime: public endpoint — no credential required.',
        method: 'DELETE',
        path: '/resources/{resourceId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testProbeHead',
        title: 'Probe HEAD',
        description:
            'Intent:\nHarness HEAD method\n\nMeta:\noperationId: test-probe-head\n\nExample:\nHEAD probe\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'HEAD',
        path: '/probe',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testProbeOptions',
        title: 'Probe OPTIONS',
        description:
            'Intent:\nHarness OPTIONS method\n\nMeta:\noperationId: test-probe-options\n\nExample:\nOPTIONS probe\n\nResponse:\nHTTP 204\nNo content\n\nRuntime: public endpoint — no credential required.',
        method: 'OPTIONS',
        path: '/probe',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testTraceRoute',
        title: 'Trace route',
        description:
            'Intent:\nHarness TRACE method\n\nMeta:\noperationId: test-trace-route\n\nExample:\nTRACE trace path\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'TRACE',
        path: '/trace',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testOneOfBody',
        title: 'Post oneOf body variant a or b',
        description:
            'Intent:\nHarness oneOf body schema\n\nMCP arguments:\nsend the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-one-of-body\n\nExample:\nPost oneOf kind a valueA hello\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'POST',
        path: '/composed/one-of',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testAnyOfBody',
        title: 'Post anyOf body text or count mode',
        description:
            'Intent:\nHarness anyOf body schema\n\nMCP arguments:\nsend the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-any-of-body\n\nExample:\nPost anyOf mode text text hello\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'POST',
        path: '/composed/any-of',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testAllOfBody',
        title: 'Post allOf composed body',
        description:
            'Intent:\nHarness allOf body — expect permissive schema fallback\n\nMCP arguments:\nsend the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-all-of-body\n\nExample:\nPost allOf base x extra y\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'POST',
        path: '/composed/all-of',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testRefBody',
        title: 'Echo ref body',
        description:
            'Intent:\nHarness components $ref request body RefBodyInput\n\nMCP arguments:\nsend the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-ref-body\n\nExample:\nPost ref body payload hello\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'POST',
        path: '/echo/ref-body',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    },
    {
        toolName: 'testGetAdminSecrets',
        title: 'List admin secrets',
        description:
            'Intent:\nHarness authorize and prepare on protected tool\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-admin-secrets\n\nParameters:\n- limit (query)\n\nExample:\nList secrets limit 5\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): secrets\nDocumented errors:\nHTTP 403 — Forbidden\n\nRuntime: protected — implement checkToolAccessForTestGetAdminSecrets and prepareToolCallForTestGetAdminSecrets in src/hooks/api2ai/test-tools/testGetAdminSecrets.ts; credential sent as query "api_key".',
        method: 'GET',
        path: '/admin/secrets',
        access: 'protected',
        hasCheckToolAccess: true,
        hasPrepareToolCall: true
    },
    {
        toolName: 'testListPublicPrepared',
        title: 'List public prepared items',
        description:
            'Intent:\nHarness public tool with prepare hook\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-public-prepared\n\nParameters:\n- limit (query)\n\nExample:\nList prepared items limit 3\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): items\n\nRuntime: implement prepareToolCallForTestListPublicPrepared in src/hooks/api2ai/test-tools/testListPublicPrepared.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/prepared/public',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: true
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by stdio-mcp-server / http-mcp-server). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    prefix?: string;
};

export const requiresAuth = true;
export const authConfig: AuthConfig | undefined = {
    location: 'query',
    name: 'api_key',
    prefix: ''
};

export { verifyCredential } from '../../../src/hooks/api2ai/test-tools/verifyTestCredential.js';

export const mcpServerName = 'test-tools';
export const mcpServerVersion = '1.0.0-rc';

const checkToolAccessHooks: Record<string, (credential: string) => void | Promise<void>> = {
    testGetAdminSecrets: checkToolAccessForTestGetAdminSecrets
};

const prepareToolCallHooks: Record<
    string,
    (options: InvokeOptions, credential?: string) => InvokeOptions | Promise<InvokeOptions>
> = {
    testGetAdminSecrets: (options, credential) => prepareToolCallForTestGetAdminSecrets(options, credential!),
    testListPublicPrepared: prepareToolCallForTestListPublicPrepared
};

export const inputZodByTool = {
    testPing: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testProtectedStatus: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testGetItem: z
        .object({
            itemId: z.string(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testListItems: z
        .object({
            status: z
                .union([z.literal('open'), z.literal('done')])
                .describe('Optional filter open or done (example: open)')
                .optional(),
            tag: z.string().describe('Required category tag for the listing (example: harness)'),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testSearchItems: z
        .object({
            tags: z.union([z.array(z.string()), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testGetWithHeader: z
        .object({
            'X-Trace-Id': z.string(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testCreateResource: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .object({ name: z.string(), note: z.string().optional() })
                .strict()
                .describe('Required: name (string). Optional: note (string).')
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testPutResource: z
        .object({
            resourceId: z.string(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z.object({ name: z.string() }).strict()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testPatchResource: z
        .object({
            resourceId: z.string(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z.object({ note: z.string().optional() }).strict()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testDeleteResource: z
        .object({
            resourceId: z.string(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testProbeHead: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testProbeOptions: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testTraceRoute: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testOneOfBody: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z.union([
                z.object({ kind: z.literal('a'), valueA: z.string() }).strict(),
                z.object({ kind: z.literal('b'), valueB: z.union([z.number().int(), z.string()]) }).strict()
            ])
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testAnyOfBody: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z.union([
                z.object({ mode: z.literal('text'), text: z.string().optional() }).strict(),
                z
                    .object({ mode: z.literal('count'), count: z.union([z.number().int(), z.string()]).optional() })
                    .strict()
            ])
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testAllOfBody: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z.unknown()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testRefBody: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z.object({ payload: z.string() }).strict()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testGetAdminSecrets: z
        .object({
            limit: z.union([z.number().int(), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testListPublicPrepared: z
        .object({
            limit: z.union([z.number().int(), z.string()]).optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.')
};

const invokeParamBucketsByTool = {
    testPing: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testProtectedStatus: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testGetItem: {
        pathParams: ['itemId'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testListItems: {
        pathParams: [],
        query: ['status', 'tag'],
        headers: [],
        arrayQuery: []
    },
    testSearchItems: {
        pathParams: [],
        query: ['tags'],
        headers: [],
        arrayQuery: ['tags']
    },
    testGetWithHeader: {
        pathParams: [],
        query: [],
        headers: ['X-Trace-Id'],
        arrayQuery: []
    },
    testCreateResource: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testPutResource: {
        pathParams: ['resourceId'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testPatchResource: {
        pathParams: ['resourceId'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testDeleteResource: {
        pathParams: ['resourceId'],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testProbeHead: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testProbeOptions: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testTraceRoute: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testOneOfBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testAnyOfBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testAllOfBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testRefBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: []
    },
    testGetAdminSecrets: {
        pathParams: [],
        query: ['limit'],
        headers: [],
        arrayQuery: []
    },
    testListPublicPrepared: {
        pathParams: [],
        query: ['limit'],
        headers: [],
        arrayQuery: []
    }
};
const invokeBodySchemaByTool = {
    testCreateResource: {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            note: {
                type: 'string'
            }
        },
        required: ['name'],
        additionalProperties: false
    },
    testPutResource: {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            }
        },
        required: ['name'],
        additionalProperties: false
    },
    testPatchResource: {
        type: 'object',
        properties: {
            note: {
                type: 'string'
            }
        },
        required: [],
        additionalProperties: false
    },
    testOneOfBody: {
        oneOf: [
            {
                type: 'object',
                properties: {
                    kind: {
                        enum: ['a'],
                        type: 'string'
                    },
                    valueA: {
                        type: 'string'
                    }
                },
                required: ['kind', 'valueA'],
                additionalProperties: false
            },
            {
                type: 'object',
                properties: {
                    kind: {
                        enum: ['b'],
                        type: 'string'
                    },
                    valueB: {
                        type: 'integer'
                    }
                },
                required: ['kind', 'valueB'],
                additionalProperties: false
            }
        ]
    },
    testAnyOfBody: {
        anyOf: [
            {
                type: 'object',
                properties: {
                    mode: {
                        enum: ['text'],
                        type: 'string'
                    },
                    text: {
                        type: 'string'
                    }
                },
                required: ['mode'],
                additionalProperties: false
            },
            {
                type: 'object',
                properties: {
                    mode: {
                        enum: ['count'],
                        type: 'string'
                    },
                    count: {
                        type: 'integer'
                    }
                },
                required: ['mode'],
                additionalProperties: false
            }
        ]
    },
    testAllOfBody: {
        allOf: [
            {
                type: 'object',
                properties: {
                    base: {
                        type: 'string'
                    }
                },
                required: [],
                additionalProperties: false
            },
            {
                type: 'object',
                properties: {
                    extra: {
                        type: 'string'
                    }
                },
                required: [],
                additionalProperties: false
            }
        ]
    },
    testRefBody: {
        type: 'object',
        properties: {
            payload: {
                type: 'string'
            }
        },
        required: ['payload'],
        additionalProperties: false
    }
};

function coerceInvokeScalar(value: string | number | boolean): string | number | boolean {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === 'true') {
            return true;
        }
        if (trimmed === 'false') {
            return false;
        }
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            const parsed = Number(trimmed);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }
    return value;
}

function coerceInvokePathBucket(
    bucket: Record<string, string | number | boolean> | undefined
): Record<string, string | number | boolean> | undefined {
    if (!bucket) {
        return undefined;
    }
    const out: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        out[key] = coerceInvokeScalar(value);
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function coerceInvokeQueryArrayValue(value: string): ReadonlyArray<string | number | boolean> {
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => coerceInvokeScalar(part));
}

function coerceInvokeQueryBucket(toolName: string, bucket: InvokeOptions['query']): InvokeOptions['query'] {
    if (!bucket) {
        return undefined;
    }
    const arrayQueryKeys = new Set(
        (invokeParamBucketsByTool as Record<string, { arrayQuery?: string[] }>)[toolName]?.arrayQuery ?? []
    );
    const out: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            out[key] = value.map((element) => coerceInvokeScalar(element));
            continue;
        }
        if (arrayQueryKeys.has(key) && typeof value === 'string') {
            out[key] = coerceInvokeQueryArrayValue(value);
            continue;
        }
        out[key] = coerceInvokeScalar(value as string | number | boolean);
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function coerceInvokeValueBySchema(value: unknown, schema: Record<string, unknown> | undefined): unknown {
    if (!schema || value === undefined || value === null) {
        return value;
    }
    const type = schema.type;
    if (type === 'integer' || type === 'number') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return coerceInvokeScalar(value as string | number | boolean);
        }
        return value;
    }
    if (type === 'boolean') {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === 'true') {
                return true;
            }
            if (trimmed === 'false') {
                return false;
            }
        }
        return value;
    }
    if (type === 'array') {
        const items = schema.items as Record<string, unknown> | undefined;
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((part) => part.trim())
                .filter((part) => part.length > 0)
                .map((part) => (items ? coerceInvokeValueBySchema(part, items) : coerceInvokeScalar(part)));
        }
        if (Array.isArray(value)) {
            return value.map((element) =>
                items
                    ? coerceInvokeValueBySchema(element, items)
                    : coerceInvokeScalar(element as string | number | boolean)
            );
        }
        return value;
    }
    if (
        type === 'object' &&
        schema.properties &&
        typeof schema.properties === 'object' &&
        !Array.isArray(schema.properties) &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    ) {
        const props = schema.properties as Record<string, Record<string, unknown>>;
        const out: Record<string, unknown> = {};
        for (const [key, element] of Object.entries(value as Record<string, unknown>)) {
            if (element === undefined || element === null) {
                continue;
            }
            const propSchema = props[key];
            out[key] = propSchema ? coerceInvokeValueBySchema(element, propSchema) : element;
        }
        return out;
    }
    return value;
}

function coerceInvokeBody(toolName: string, body: unknown): unknown {
    if (body === undefined || body === null) {
        return body;
    }
    const schema = (invokeBodySchemaByTool as Record<string, Record<string, unknown> | undefined>)[toolName];
    if (!schema) {
        return body;
    }
    return coerceInvokeValueBySchema(body, schema);
}

function normalizeInvokeOptions(toolName: string, options: InvokeOptions): InvokeOptions {
    const buckets = (
        invokeParamBucketsByTool as Record<
            string,
            { pathParams?: string[]; query?: string[]; headers?: string[]; arrayQuery?: string[] }
        >
    )[toolName];
    if (!buckets) {
        return options;
    }
    const pathKeys = buckets.pathParams ?? [];
    const queryKeys = buckets.query ?? [];
    const headerKeys = buckets.headers ?? [];
    const arrayQueryKeys = new Set(buckets.arrayQuery ?? []);
    const knownFlatKeys = new Set([...pathKeys, ...queryKeys, ...headerKeys]);
    const hasTopLevelFlatParam = Object.keys(options).some(
        (key) =>
            key !== 'body' && key !== 'headers' && key !== 'pathParams' && key !== 'query' && knownFlatKeys.has(key)
    );
    if (!hasTopLevelFlatParam) {
        return {
            ...options,
            pathParams: coerceInvokePathBucket(options.pathParams),
            query: coerceInvokeQueryBucket(toolName, options.query),
            body: coerceInvokeBody(toolName, options.body)
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {
        ...(options.query ?? {})
    };
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams' || key === 'query') {
            continue;
        }
        if (key === 'headers') {
            if (headerKeys.length === 0 && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(headers, value as Record<string, string>);
            }
            continue;
        }
        if (pathKeys.includes(key)) {
            pathParams[key] = value as string | number | boolean;
        } else if (queryKeys.includes(key)) {
            if (arrayQueryKeys.has(key) && typeof value === 'string') {
                query[key] = coerceInvokeQueryArrayValue(value);
            } else {
                query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
            }
        } else if (headerKeys.includes(key)) {
            headers[key] = String(value);
        }
    }

    return {
        pathParams: coerceInvokePathBucket(pathParams),
        query: coerceInvokeQueryBucket(toolName, query),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: coerceInvokeBody(toolName, options.body)
    };
}
const queryParamSerializationByTool = {
    testPing: {},
    testProtectedStatus: {},
    testGetItem: {},
    testListItems: {
        status: {
            style: 'form',
            explode: true
        },
        tag: {
            style: 'form',
            explode: true
        }
    },
    testSearchItems: {
        tags: {
            style: 'form',
            explode: true
        }
    },
    testGetWithHeader: {},
    testCreateResource: {},
    testPutResource: {},
    testPatchResource: {},
    testDeleteResource: {},
    testProbeHead: {},
    testProbeOptions: {},
    testTraceRoute: {},
    testOneOfBody: {},
    testAnyOfBody: {},
    testAllOfBody: {},
    testRefBody: {},
    testGetAdminSecrets: {
        limit: {
            style: 'form',
            explode: true
        }
    },
    testListPublicPrepared: {
        limit: {
            style: 'form',
            explode: true
        }
    }
};

function appendSerializedQueryParams(
    searchParams: URLSearchParams,
    toolName: string,
    query: InvokeOptions['query']
): void {
    if (!query) {
        return;
    }
    const hintsByParam: Record<string, { style?: string; explode?: boolean }> =
        (queryParamSerializationByTool as Record<string, Record<string, { style?: string; explode?: boolean }>>)[
            toolName
        ] ?? {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            const hint = hintsByParam[key];
            const style = hint && hint.style ? hint.style : 'form';
            const explode = hint && typeof hint.explode === 'boolean' ? hint.explode : true;
            if (style !== 'form') {
                throw new Error(
                    'invokeTool: query array param "' +
                        key +
                        '" uses OpenAPI style "' +
                        style +
                        '"; only style "form" is supported for arrays.'
                );
            }
            const parts: string[] = [];
            for (const element of value) {
                if (element === undefined || element === null) {
                    continue;
                }
                parts.push(String(element));
            }
            if (parts.length === 0) {
                continue;
            }
            if (explode) {
                for (const p of parts) {
                    searchParams.append(key, p);
                }
            } else {
                searchParams.set(key, parts.join(','));
            }
            continue;
        }
        searchParams.set(key, String(value));
    }
}

function resolveAuthSecret(
    authConfig: { location: 'header' | 'query'; name: string; prefix?: string },
    credential: string | undefined
): string {
    if (!credential || !String(credential).trim()) {
        throw new Error(
            'Missing host credential (stdio: --auth-env; HTTP: auth header; OAuth HTTP: Bearer after MCP login).'
        );
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}
async function performToolHttpRequest(
    url: URL,
    init: { method: string; headers: Record<string, string>; body?: string }
): Promise<Response> {
    if (init.method !== 'TRACE') {
        return fetch(url, init as RequestInit);
    }
    const client = url.protocol === 'https:' ? await import('node:https') : await import('node:http');
    return new Promise((resolve, reject) => {
        const req = client.request(
            {
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port || undefined,
                path: url.pathname + url.search,
                method: 'TRACE',
                headers: init.headers
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer) => chunks.push(chunk));
                res.on('end', () => {
                    const responseHeaders = new Headers();
                    for (const [name, value] of Object.entries(res.headers)) {
                        if (value === undefined) {
                            continue;
                        }
                        if (Array.isArray(value)) {
                            for (const entry of value) {
                                responseHeaders.append(name, entry);
                            }
                        } else {
                            responseHeaders.set(name, value);
                        }
                    }
                    resolve(
                        new Response(Buffer.concat(chunks), {
                            status: res.statusCode ?? 500,
                            headers: responseHeaders
                        })
                    );
                });
            }
        );
        req.on('error', reject);
        if (init.body) {
            req.write(init.body);
        }
        req.end();
    });
}

export async function invokeTool(
    toolName: string,
    options: InvokeOptions = {},
    hostContext?: ApiHostContext
): Promise<unknown> {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }
    loggingAdapter.debug('invokeTool', { toolName, method: tool.method, path: tool.path });
    let optionsResolved = normalizeInvokeOptions(toolName, options);

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let credential: string | undefined = host.credential?.trim() ? String(host.credential).trim() : undefined;
    let authCredential: string | undefined = credential;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on stdio-mcp-server; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
            );
        }
        credential = String(inbound).trim();
        await verifyCredential(credential);
        if (tool.hasCheckToolAccess) {
            const checkToolAccess = checkToolAccessHooks[toolName];
            if (typeof checkToolAccess !== 'function') {
                throw new Error('No checkToolAccess hook for tool: ' + toolName);
            }
            await Promise.resolve(checkToolAccess(credential));
        }
        authCredential = credential;
    }
    if (tool.hasPrepareToolCall) {
        const prepareToolCall = prepareToolCallHooks[toolName];
        if (typeof prepareToolCall !== 'function') {
            throw new Error('No prepareToolCall hook for tool: ' + toolName);
        }
        if (tool.access === 'protected') {
            if (credential === undefined) {
                throw new Error('prepareToolCall requires credential for protected tools.');
            }
            optionsResolved = await Promise.resolve(prepareToolCall(optionsResolved, credential));
        } else {
            optionsResolved = await Promise.resolve(prepareToolCall(optionsResolved));
        }
    }
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json',
        ...(optionsResolved.headers ?? {})
    };
    if (authConfig && tool.access === 'protected') {
        const authValue = resolveAuthSecret(authConfig!, authCredential);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }

    const requestInit: Record<string, unknown> = {
        method: tool.method,
        headers: requestHeaders
    };

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }

    const response = await performToolHttpRequest(url, {
        method: tool.method,
        headers: requestHeaders as Record<string, string>,
        body: typeof requestInit.body === 'string' ? requestInit.body : undefined
    });
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            /* ignore unreadable error body */
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            if (authConfig && tool.access === 'protected') {
                msg +=
                    ' Check MCP host --auth-env on stdio-mcp-server (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
            }
        } else if (response.status === 403) {
            msg += ' Forbidden: insufficient permission for this request.';
        } else if (response.status === 429) {
            msg += ' Too Many Requests (rate limited).';
            if (retryAfter) {
                msg += ' Retry-After: ' + retryAfter + ' (seconds or HTTP-date per server).';
            } else {
                msg += ' Wait before retrying.';
            }
        }
        if (bodySnippet) {
            msg += ' Response body: ' + bodySnippet;
        }
        loggingAdapter.error(msg, { toolName: tool.toolName, status: response.status });
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
