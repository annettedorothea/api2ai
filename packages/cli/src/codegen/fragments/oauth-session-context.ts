/** api2ai OAuth session host context (no DB enrichment). */
export function resolveHostContextForOAuthSessionFragment(): string {
    return `
async function resolveHostContextForOAuthSession(
    httpHostConfig: OAuthHttpHostRuntimeConfig,
    generated: GeneratedHostModule,
    headers: Record<string, string | string[] | undefined>,
    sessionStore: Map<string, McpOAuthSession>,
    sessionId: string | undefined
): Promise<ApiLikeHostContext> {
    const apiFields = oauthHostContextBaseUrlFields(httpHostConfig, generated);
    let session = sessionId ? sessionStore.get(sessionId) : undefined;
    if (sessionId && !session) {
        session = { sessionId, createdAt: Date.now() };
        sessionStore.set(sessionId, session);
    }

    const bearer = readBearerFromHeaders(headers);
    const inbound = bearer?.trim();

    if (
        session?.exchangedAt &&
        session.credential &&
        (!inbound || session.sourceCredential === inbound)
    ) {
        return {
            ...apiFields,
            credential: session.credential
        };
    }

    if (!inbound) {
        if (session?.credential) {
            return {
                ...apiFields,
                credential: session.credential
            };
        }
        return { ...apiFields };
    }

    const credential = await resolveOAuthSessionCredential(generated, inbound, session);

    return {
        ...apiFields,
        credential
    };
}`.trim();
}
