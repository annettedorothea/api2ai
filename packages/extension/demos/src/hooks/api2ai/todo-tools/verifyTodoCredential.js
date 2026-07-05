export async function verifyTodoCredential(credential) {
    const expected = process.env.TODO_API_KEY?.trim();
    if (!expected) {
        throw new Error('TODO_API_KEY is not set (expected MCP x-api-token value).');
    }
    if (credential.trim() !== expected) {
        throw new Error('Invalid MCP API key for todo demo.');
    }
}
export { verifyTodoCredential as verifyCredential };
