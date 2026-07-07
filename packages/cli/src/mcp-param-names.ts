/** MCP tool input property names must satisfy Cursor's schema validator (no dots, etc.). */
export function isValidMcpParamName(name: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/** Map an OpenAPI wire parameter name to a Cursor-safe MCP property name. */
export function toMcpParamName(wireName: string): string {
    if (isValidMcpParamName(wireName)) {
        return wireName;
    }
    let mcp = wireName.replace(/[^A-Za-z0-9_]/g, '_');
    if (!/^[A-Za-z_]/.test(mcp)) {
        mcp = `_${mcp}`;
    }
    return mcp;
}

export type ParamWireMaps = {
    /** MCP property name → OpenAPI wire name (only when they differ). */
    mcpToWire: Record<string, string>;
    /** OpenAPI wire name → MCP property name. */
    wireToMcp: Record<string, string>;
};

/** Build bidirectional maps for a set of OpenAPI parameter wire names. */
export function buildParamWireMaps(wireNames: readonly string[]): ParamWireMaps {
    const mcpToWire: Record<string, string> = {};
    const wireToMcp: Record<string, string> = {};
    const mcpOwner = new Map<string, string>();

    for (const wire of wireNames) {
        const mcp = toMcpParamName(wire);
        wireToMcp[wire] = mcp;
        const owner = mcpOwner.get(mcp);
        if (owner !== undefined && owner !== wire) {
            throw new Error(
                `MCP param name collision: OpenAPI parameters "${owner}" and "${wire}" both map to MCP name "${mcp}".`
            );
        }
        mcpOwner.set(mcp, wire);
        if (mcp !== wire) {
            mcpToWire[mcp] = wire;
        }
    }

    return { mcpToWire, wireToMcp };
}

/** Replace OpenAPI wire parameter names with MCP-safe names in prose (Cursor parses tool descriptions). */
export function sanitizeWireParamNamesInText(text: string, wireToMcp: Record<string, string>): string {
    const replacements = Object.entries(wireToMcp).filter(([wire, mcp]) => wire !== mcp);
    replacements.sort((a, b) => b[0].length - a[0].length);
    let out = text;
    for (const [wire, mcp] of replacements) {
        out = out.split(wire).join(mcp);
    }
    return out
        .replace(/\b([A-Za-z_][A-Za-z0-9_]*)\.gte\b/g, '$1_gte')
        .replace(/\b([A-Za-z_][A-Za-z0-9_]*)\.lte\b/g, '$1_lte');
}
