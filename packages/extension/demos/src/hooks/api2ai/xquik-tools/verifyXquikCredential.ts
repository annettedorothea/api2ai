export async function verifyXquikCredential(credential: string): Promise<void> {
    const expected = process.env.XQUIK_API_KEY?.trim();
    if (!expected) {
        throw new Error('XQUIK_API_KEY is not set.');
    }
    if (credential.trim() !== expected) {
        throw new Error('Invalid MCP API key for xquik demo.');
    }
}

export { verifyXquikCredential as verifyCredential };
