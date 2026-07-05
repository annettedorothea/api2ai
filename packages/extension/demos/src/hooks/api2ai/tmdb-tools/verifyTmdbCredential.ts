export async function verifyTmdbCredential(credential: string): Promise<void> {
    if (!credential.trim()) {
        throw new Error('Missing TMDB access token from MCP host (--auth-env).');
    }
}

export { verifyTmdbCredential as verifyCredential };
