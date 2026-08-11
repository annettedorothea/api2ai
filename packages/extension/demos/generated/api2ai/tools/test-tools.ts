/**
 * Generated from: test.api2ai
 * Referenced OpenAPI: ./openapi/test.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';
import { verifyCredential } from '../../../src/hooks/api2ai/test-tools/verifyTestCredential.js';
import { checkToolAccessForTestGetAdminSecrets } from '../../../src/hooks/api2ai/test-tools/checkToolAccessForTestGetAdminSecrets.js';
import { prepareToolCallForTestGetAdminSecrets } from '../../../src/hooks/api2ai/test-tools/prepareToolCallForTestGetAdminSecrets.js';
import { prepareToolCallForTestListPublicPrepared } from '../../../src/hooks/api2ai/test-tools/prepareToolCallForTestListPublicPrepared.js';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
    hasAfterToolCall: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'testPing',
        title: 'Public ping',
        description:
            'Intent:\nHarness public GET ping\n\nMeta:\noperationId: test-ping\n\nExample:\nPing the test API\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): ok\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/ping',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testProtectedStatus',
        title: 'Protected status',
        description:
            'Intent:\nHarness protected route with query api_key\n\nMeta:\noperationId: test-protected-status\n\nExample:\nGet protected status\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): status\nDocumented errors:\nHTTP 401 — Unauthorized\n\nRuntime: protected — implement src/hooks/api2ai/test-tools/verifyTestCredential.ts; credential sent as query "api_key".',
        method: 'GET',
        path: '/protected/status',
        access: 'protected',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testGetItem',
        title: 'Get item by id',
        description:
            'Intent:\nHarness path param itemId\n\nMCP arguments:\npass itemId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-get-item\n\nExample:\nGet item item-1\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): itemId\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items/{itemId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testGetAccount',
        title: 'Get account by dotted path param',
        description:
            'Intent:\nHarness dotted path param account.id mapped to account_id\n\nMCP arguments:\npass account_id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-get-account\n\nExample:\nGet account acc-42\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): accountId\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/accounts/{account.id}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testListItems',
        title: 'List items by tag',
        description:
            'Intent:\nHarness query params status (optional enum) and tag (required)\n\nMCP arguments:\npass status, tag as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-list-items\n\nExample:\nList open items for tag harness\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): items\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testSearchItems',
        title: 'Search items by tags',
        description:
            'Intent:\nHarness query array tags\n\nMCP arguments:\npass tags as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-search-items\n\nExample:\nSearch tags alpha and beta\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): tags\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items/search',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testGetWithHeader',
        title: 'Get item with trace header',
        description:
            'Intent:\nHarness required header X-Trace-Id on upstream request\n\nMCP arguments:\npass X_Trace_Id as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-get-with-header\n\nExample:\nCall with trace id trace-1\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): traceId\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/items/with-header',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testPutResource',
        title: 'Replace resource',
        description:
            'Intent:\nHarness PUT with $ref body ResourceUpdate\n\nMCP arguments:\npass resourceId as top-level tool arguments; send the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-put-resource\n\nExample:\nPut resource res-1 name MCPTEST-updated\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): name, resourceId\n\nRuntime: public endpoint — no credential required.',
        method: 'PUT',
        path: '/resources/{resourceId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testPatchResource',
        title: 'Patch resource note',
        description:
            'Intent:\nHarness PATCH with $ref body ResourcePatch\n\nMCP arguments:\npass resourceId as top-level tool arguments; send the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-patch-resource\n\nExample:\nPatch resource res-1 note MCPTEST-note\n\nResponse:\nHTTP 200\nOK\n\nRuntime: public endpoint — no credential required.',
        method: 'PATCH',
        path: '/resources/{resourceId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testDeleteResource',
        title: 'Delete resource',
        description:
            'Intent:\nHarness DELETE without body\n\nMCP arguments:\npass resourceId as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-delete-resource\n\nExample:\nDelete resource res-1\n\nResponse:\nHTTP 204\nNo content\n\nRuntime: public endpoint — no credential required.',
        method: 'DELETE',
        path: '/resources/{resourceId}',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
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
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testLabeledMap',
        title: 'Post labeled map with extra keys',
        description:
            'Intent:\nHarness body with known labeled fields plus extra LabeledValue keys\n\nMCP arguments:\nsend the request payload in the `body` property. Do not nest path or query parameters under pathParams or query.\n\nAPI:\nRequest body has known labeled fields and allows extra keys of the same LabeledValue shape (Zod catchall regression).\n\nMeta:\noperationId: test-labeled-map\n\nRequest body:\nRequired: title, region, category (each { value: string }).\n        Extra keys of the same shape are allowed (additionalProperties).\n\nExample:\nPost labeled map title Demo region north category general customTag extra-1\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): received\n\nRuntime: public endpoint — no credential required.',
        method: 'POST',
        path: '/labeled-map',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false,
        hasAfterToolCall: false
    },
    {
        toolName: 'testGetAdminSecrets',
        title: 'List admin secrets',
        description:
            'Intent:\nHarness authorize and prepare on protected tool\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-admin-secrets\n\nExample:\nList secrets limit 5\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): secrets\nDocumented errors:\nHTTP 403 — Forbidden\n\nRuntime: protected — implement checkToolAccessForTestGetAdminSecrets in src/hooks/api2ai/test-tools/checkToolAccessForTestGetAdminSecrets.ts and prepareToolCallForTestGetAdminSecrets in src/hooks/api2ai/test-tools/prepareToolCallForTestGetAdminSecrets.ts; credential sent as query "api_key".',
        method: 'GET',
        path: '/admin/secrets',
        access: 'protected',
        hasCheckToolAccess: true,
        hasPrepareToolCall: true,
        hasAfterToolCall: false
    },
    {
        toolName: 'testListPublicPrepared',
        title: 'List public prepared items',
        description:
            'Intent:\nHarness public tool with prepare hook\n\nMCP arguments:\npass limit as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nMeta:\noperationId: test-public-prepared\n\nExample:\nList prepared items limit 3\n\nResponse:\nHTTP 200\nOK\ncontent-type: application/json\nproperties (top-level): items\n\nRuntime: implement prepareToolCallForTestListPublicPrepared in src/hooks/api2ai/test-tools/prepareToolCallForTestListPublicPrepared.ts (types from this tools module; run build:generated for .js).',
        method: 'GET',
        path: '/prepared/public',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: true,
        hasAfterToolCall: false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by the MCP host in servers/*). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
    /** MCP-only args from DSL hookParams — never sent on the HTTP request. */
    hookParams?: Record<string, unknown>;
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
export const mcpServerVersion = '1.2.1';

export { mcpBuildGeneratedAt } from '../mcp-build-generated-at.js';

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
    testGetAccount: z
        .object({
            account_id: z.string(),
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
                .describe('Optional filter open or done (type: string) (example: open)')
                .optional(),
            tag: z.string().describe('Required category tag for the listing (type: string) (example: harness)'),
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
            X_Trace_Id: z.string(),
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
                z.object({ kind: z.literal('b'), valueB: z.number().int() }).strict()
            ])
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testAnyOfBody: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z.union([
                z.object({ mode: z.literal('text'), text: z.string().optional() }).strict(),
                z.object({ mode: z.literal('count'), count: z.number().int().optional() }).strict()
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
    testLabeledMap: z
        .object({
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .object({
                    title: z.object({ value: z.string() }).strict(),
                    region: z.object({ value: z.string() }).strict(),
                    category: z.object({ value: z.string() }).strict()
                })
                .catchall(z.object({ value: z.string() }).strict())
                .describe(
                    'Required: title, region, category (each { value: string }).\n        Extra keys of the same shape are allowed (additionalProperties).'
                )
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.'),
    testGetAdminSecrets: z
        .object({
            limit: z.number().int().optional(),
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
            limit: z.number().int().optional(),
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
        arrayQuery: [],
        hookParams: []
    },
    testProtectedStatus: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testGetItem: {
        pathParams: ['itemId'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testGetAccount: {
        pathParams: ['account_id'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testListItems: {
        pathParams: [],
        query: ['status', 'tag'],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testSearchItems: {
        pathParams: [],
        query: ['tags'],
        headers: [],
        arrayQuery: ['tags'],
        hookParams: []
    },
    testGetWithHeader: {
        pathParams: [],
        query: [],
        headers: ['X_Trace_Id'],
        arrayQuery: [],
        hookParams: []
    },
    testCreateResource: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testPutResource: {
        pathParams: ['resourceId'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testPatchResource: {
        pathParams: ['resourceId'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testDeleteResource: {
        pathParams: ['resourceId'],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testProbeHead: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testProbeOptions: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testTraceRoute: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testOneOfBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testAnyOfBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testAllOfBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testRefBody: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testLabeledMap: {
        pathParams: [],
        query: [],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testGetAdminSecrets: {
        pathParams: [],
        query: ['limit'],
        headers: [],
        arrayQuery: [],
        hookParams: []
    },
    testListPublicPrepared: {
        pathParams: [],
        query: ['limit'],
        headers: [],
        arrayQuery: [],
        hookParams: []
    }
};

function splitInvokeQueryArrayValue(value: string): ReadonlyArray<string | number | boolean> {
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function prepareQueryBucket(toolName: string, bucket: InvokeOptions['query']): InvokeOptions['query'] {
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
        if (arrayQueryKeys.has(key) && typeof value === 'string') {
            out[key] = splitInvokeQueryArrayValue(value);
            continue;
        }
        out[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function omitNullishPathParams(
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
        out[key] = value;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function isInvokeQueryBucketValue(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeInvokeOptions(toolName: string, options: InvokeOptions): InvokeOptions {
    const buckets = (
        invokeParamBucketsByTool as Record<
            string,
            {
                pathParams?: string[];
                query?: string[];
                headers?: string[];
                arrayQuery?: string[];
                hookParams?: string[];
            }
        >
    )[toolName];
    if (!buckets) {
        return options;
    }
    const pathKeys = buckets.pathParams ?? [];
    const queryKeys = buckets.query ?? [];
    const headerKeys = buckets.headers ?? [];
    const hookKeys = buckets.hookParams ?? [];
    const arrayQueryKeys = new Set(buckets.arrayQuery ?? []);
    const hookKeySet = new Set(hookKeys);
    const knownFlatKeys = new Set([...pathKeys, ...queryKeys, ...headerKeys, ...hookKeys]);
    const collectHookParams = (): Record<string, unknown> | undefined => {
        const fromBag: Record<string, unknown> =
            options.hookParams && typeof options.hookParams === 'object' && !Array.isArray(options.hookParams)
                ? { ...options.hookParams }
                : {};
        for (const key of hookKeys) {
            if (Object.prototype.hasOwnProperty.call(options, key) && options[key as keyof InvokeOptions] != null) {
                fromBag[key] = (options as Record<string, unknown>)[key];
            }
        }
        return Object.keys(fromBag).length > 0 ? fromBag : undefined;
    };
    const hasTopLevelFlatParam = Object.keys(options).some((key) => {
        if (key === 'body' || key === 'pathParams' || key === 'headers' || key === 'hookParams') {
            return false;
        }
        if (key === 'query') {
            return queryKeys.includes('query') && !isInvokeQueryBucketValue(options.query);
        }
        return knownFlatKeys.has(key);
    });
    if (!hasTopLevelFlatParam) {
        const hookBag = collectHookParams();
        return {
            ...options,
            pathParams: omitNullishPathParams(options.pathParams),
            query: prepareQueryBucket(toolName, isInvokeQueryBucketValue(options.query) ? options.query : undefined),
            ...(hookBag ? { hookParams: hookBag } : {})
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> =
        isInvokeQueryBucketValue(options.query)
            ? {
                  ...(options.query as Record<
                      string,
                      string | number | boolean | ReadonlyArray<string | number | boolean>
                  >)
              }
            : {};
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};
    const hookParams: Record<string, unknown> =
        options.hookParams && typeof options.hookParams === 'object' && !Array.isArray(options.hookParams)
            ? { ...options.hookParams }
            : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams' || key === 'hookParams') {
            continue;
        }
        if (key === 'query') {
            if (queryKeys.includes('query') && !isInvokeQueryBucketValue(value)) {
                if (arrayQueryKeys.has(key) && typeof value === 'string') {
                    query[key] = splitInvokeQueryArrayValue(value);
                } else {
                    query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
                }
            }
            continue;
        }
        if (key === 'headers') {
            if (headerKeys.length === 0 && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(headers, value as Record<string, string>);
            }
            continue;
        }
        if (hookKeySet.has(key)) {
            hookParams[key] = value;
            continue;
        }
        if (pathKeys.includes(key)) {
            pathParams[key] = value as string | number | boolean;
        } else if (queryKeys.includes(key)) {
            if (arrayQueryKeys.has(key) && typeof value === 'string') {
                query[key] = splitInvokeQueryArrayValue(value);
            } else {
                query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
            }
        } else if (headerKeys.includes(key)) {
            headers[key] = String(value);
        }
    }

    return {
        pathParams: omitNullishPathParams(pathParams),
        query: prepareQueryBucket(toolName, query),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: options.body,
        ...(Object.keys(hookParams).length > 0 ? { hookParams } : {})
    };
}
const queryParamSerializationByTool = {
    testPing: {},
    testProtectedStatus: {},
    testGetItem: {},
    testGetAccount: {},
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
    testLabeledMap: {},
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
const queryParamWireNamesByTool = {
    testPing: {},
    testProtectedStatus: {},
    testGetItem: {},
    testGetAccount: {},
    testListItems: {},
    testSearchItems: {},
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
    testLabeledMap: {},
    testGetAdminSecrets: {},
    testListPublicPrepared: {}
};
const pathParamWireNamesByTool = {
    testPing: {},
    testProtectedStatus: {},
    testGetItem: {},
    testGetAccount: {
        account_id: 'account.id'
    },
    testListItems: {},
    testSearchItems: {},
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
    testLabeledMap: {},
    testGetAdminSecrets: {},
    testListPublicPrepared: {}
};
const headerParamWireNamesByTool = {
    testPing: {},
    testProtectedStatus: {},
    testGetItem: {},
    testGetAccount: {},
    testListItems: {},
    testSearchItems: {},
    testGetWithHeader: {
        X_Trace_Id: 'X-Trace-Id'
    },
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
    testLabeledMap: {},
    testGetAdminSecrets: {},
    testListPublicPrepared: {}
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
    const wireNames: Record<string, string> =
        (queryParamWireNamesByTool as Record<string, Record<string, string>>)[toolName] ?? {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        const wireKey = wireNames[key] ?? key;
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
                    searchParams.append(wireKey, p);
                }
            } else {
                searchParams.set(wireKey, parts.join(','));
            }
            continue;
        }
        searchParams.set(wireKey, String(value));
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
const HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT = 5242880;

function resolveHttpSuccessBodyMaxBytes(): number {
    const raw = process.env.TOOLFACTORY_HTTP_BODY_MAX_BYTES;
    if (raw === undefined || raw.trim().length === 0) {
        return HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT;
    }
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        return HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT;
    }
    return parsed;
}

function parseMimeType(contentTypeHeader: string): string {
    const raw = contentTypeHeader.split(';')[0]?.trim().toLowerCase() ?? '';
    return raw;
}

function isJsonMimeType(mime: string): boolean {
    return mime === 'application/json' || mime.endsWith('+json');
}

function isTextualMimeType(mime: string): boolean {
    if (!mime) {
        return false;
    }
    if (mime.startsWith('text/')) {
        return true;
    }
    return (
        mime === 'application/xml' ||
        mime === 'application/javascript' ||
        mime === 'application/xhtml+xml' ||
        mime === 'application/x-www-form-urlencoded'
    );
}

function parseFilenameFromContentDisposition(header: string | null): string | undefined {
    if (!header) {
        return undefined;
    }
    const star = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(header);
    if (star?.[1]) {
        try {
            return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ''));
        } catch {
            return star[1].trim().replace(/^["']|["']$/g, '');
        }
    }
    const plain = /filename=(["']?)([^"';]+)\1/i.exec(header);
    if (plain?.[2]) {
        return plain[2].trim();
    }
    return undefined;
}

function assertBodyWithinLimit(byteLength: number, toolLabel: string, maxBytes: number): void {
    if (byteLength > maxBytes) {
        throw new Error(
            'HTTP response body for ' +
                toolLabel +
                ' is ' +
                byteLength +
                ' bytes; maximum allowed is ' +
                maxBytes +
                ' bytes.'
        );
    }
}

async function decodeHttpSuccessResponse(response: Response, method: string, toolLabel: string): Promise<unknown> {
    const maxBytes = resolveHttpSuccessBodyMaxBytes();
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
        const declared = Number(contentLengthHeader);
        if (Number.isFinite(declared) && declared > maxBytes) {
            assertBodyWithinLimit(declared, toolLabel, maxBytes);
        }
    }

    if (response.status === 204 || method === 'HEAD') {
        return { kind: 'empty', status: response.status };
    }
    if (contentLengthHeader === '0') {
        return { kind: 'empty', status: response.status };
    }

    const mime = parseMimeType(response.headers.get('content-type') ?? '');

    if (isJsonMimeType(mime)) {
        const text = await response.text();
        assertBodyWithinLimit(Buffer.byteLength(text, 'utf8'), toolLabel, maxBytes);
        if (text.trim().length === 0) {
            return { kind: 'empty', status: response.status };
        }
        return JSON.parse(text) as unknown;
    }

    if (isTextualMimeType(mime)) {
        const text = await response.text();
        assertBodyWithinLimit(Buffer.byteLength(text, 'utf8'), toolLabel, maxBytes);
        if (text.trim().length === 0) {
            return { kind: 'empty', status: response.status };
        }
        return text;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    assertBodyWithinLimit(buffer.byteLength, toolLabel, maxBytes);
    if (buffer.byteLength === 0) {
        return { kind: 'empty', status: response.status };
    }
    const filename = parseFilenameFromContentDisposition(response.headers.get('content-disposition'));
    const envelope: {
        kind: 'binary';
        encoding: 'base64';
        contentType: string;
        byteLength: number;
        data: string;
        filename?: string;
    } = {
        kind: 'binary',
        encoding: 'base64',
        contentType: mime || 'application/octet-stream',
        byteLength: buffer.byteLength,
        data: buffer.toString('base64')
    };
    if (filename) {
        envelope.filename = filename;
    }
    return envelope;
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
        throw new Error('invokeTool requires hostContext from the MCP host (servers/*-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    let credential: string | undefined = host.credential?.trim() ? String(host.credential).trim() : undefined;
    let authCredential: string | undefined = credential;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {
            throw new Error(
                'Missing host credential. stdio: set env for --auth-env on the MCP host; passthrough HTTP: MCP auth header (e.g. x-api-token); OAuth HTTP: complete MCP login (Authorization Bearer from Cursor).'
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
    const pathWireNames: Record<string, string> =
        (pathParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        const wireKey = pathWireNames[key] ?? key;
        resolvedPath = resolvedPath.split('{' + wireKey + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const headerWireNames: Record<string, string> =
        (headerParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json'
    };
    if (optionsResolved.headers) {
        for (const [key, value] of Object.entries(optionsResolved.headers)) {
            const wireKey = headerWireNames[key] ?? key;
            requestHeaders[wireKey] = value;
        }
    }
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
                msg += ' Check MCP host --auth-env (' + authConfig.location + ' ' + authConfig.name + ').';
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

    return decodeHttpSuccessResponse(response, tool.method, tool.toolName);
}
