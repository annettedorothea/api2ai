export class GithubCredentials {
    toString() {
        return '[github relay]';
    }
}
export function toGithubCredentials(_data) {
    return new GithubCredentials();
}
/** Opaque PAT relay — upstream GitHub API validates the token. */
export async function verifyGithubCredentials(input) {
    const upstreamCredential = String(input.inboundCredential).trim();
    if (!upstreamCredential) {
        throw new Error('Missing inbound MCP credential for GitHub.');
    }
    return {
        upstreamCredential,
        credentials: toGithubCredentials()
    };
}
export { verifyGithubCredentials as verifyCredential, toGithubCredentials as toModuleCredentials };
