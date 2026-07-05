export async function verifyTmdbCredential(credential) {
    if (!credential.trim()) {
        throw new Error('Missing TMDB access token from MCP host (--auth-env).');
    }
}
export { verifyTmdbCredential as verifyCredential };
