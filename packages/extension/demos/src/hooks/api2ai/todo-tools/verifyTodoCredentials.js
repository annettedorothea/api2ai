export class TodoCredentials {
    toString() {
        return '[todo api-key]';
    }
}
export function toTodoCredentials(_data) {
    return new TodoCredentials();
}
export async function verifyTodoCredentials(input) {
    const expected = process.env.TODO_API_KEY?.trim();
    if (!expected) {
        throw new Error('TODO_API_KEY is not set (expected MCP x-api-token value).');
    }
    const inbound = String(input.inboundCredential).trim();
    if (inbound !== expected) {
        throw new Error('Invalid MCP API key for todo demo.');
    }
    return {
        upstreamCredential: inbound,
        credentials: toTodoCredentials()
    };
}
export { verifyTodoCredentials as verifyCredential, toTodoCredentials as toModuleCredentials };
