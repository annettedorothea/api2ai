export class TmdbCredentials {
    toString() {
        return '[tmdb relay]';
    }
}
export function toTmdbCredentials(_data) {
    return new TmdbCredentials();
}
/** Opaque access-token relay — upstream TMDB API validates the token. */
export async function verifyTmdbCredentials(input) {
    const upstreamCredential = String(input.inboundCredential).trim();
    if (!upstreamCredential) {
        throw new Error('Missing inbound MCP credential for TMDB.');
    }
    return {
        upstreamCredential,
        credentials: toTmdbCredentials()
    };
}
export { verifyTmdbCredentials as verifyCredential, toTmdbCredentials as toModuleCredentials };
