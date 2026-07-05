export async function verifyTestCredential(credential) {
    const expected = process.env.TEST_API_KEY?.trim() || 'demo-test-api-key';
    if (credential.trim() !== expected) {
        throw new Error('Invalid MCP API key for test harness demo.');
    }
}
export { verifyTestCredential as verifyCredential };
