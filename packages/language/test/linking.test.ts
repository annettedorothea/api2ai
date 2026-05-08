import { describe, expect, test } from "vitest";

/*
let services: ReturnType<typeof createApi2AiDslServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createApi2AiDslServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Api2AiDsl);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});
*/

describe('Linking tests', () => {

    test('placeholder linking smoke test', () => {
        expect(true).toBe(true);
    });
});
