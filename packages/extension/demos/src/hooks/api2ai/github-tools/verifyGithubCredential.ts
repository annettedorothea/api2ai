export async function verifyGithubCredential(credential: string): Promise<void> {
    if (!credential.trim()) {
        throw new Error('Missing inbound MCP credential for GitHub.');
    }
}

export { verifyGithubCredential as verifyCredential };
