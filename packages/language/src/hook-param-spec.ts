import type { HookParamEntry, HookParamSpec, HookParamSpecField, Operation } from './generated/ast.js';
import { isHookParamSpecField } from './generated/ast.js';

export type ParsedHookParamSpec = {
    description?: string;
    example?: string;
    paramType?: string;
};

export function parseHookParamSpec(spec: HookParamSpec | undefined): ParsedHookParamSpec {
    const out: ParsedHookParamSpec = {};
    if (!spec) {
        return out;
    }
    for (const field of spec.fields) {
        if (!isHookParamSpecField(field)) {
            continue;
        }
        if (field.description !== undefined) {
            out.description = String(field.description);
        }
        if (field.example !== undefined) {
            out.example = String(field.example);
        }
        if (field.paramType !== undefined) {
            out.paramType = String(field.paramType);
        }
    }
    return out;
}

export function hookParamFieldKind(field: HookParamSpecField): 'description' | 'example' | 'type' | undefined {
    if (field.description !== undefined) {
        return 'description';
    }
    if (field.example !== undefined) {
        return 'example';
    }
    if (field.paramType !== undefined) {
        return 'type';
    }
    return undefined;
}

export function usedHookParamSpecFieldKinds(spec: HookParamSpec | undefined): Set<string> {
    const used = new Set<string>();
    if (!spec) {
        return used;
    }
    for (const field of spec.fields) {
        const kind = hookParamFieldKind(field);
        if (kind) {
            used.add(kind);
        }
    }
    return used;
}

/** Reserved flat MCP / InvokeOptions keys that must not be used as hookParams. */
export const RESERVED_HOOK_PARAM_NAMES = new Set(['body', 'headers', 'pathParams', 'query', 'hookParams']);

export type HookParamDslEntry = {
    name: string;
    description?: string;
    example?: string;
    paramType: string;
};

export function listHookParamEntries(operation: Operation): readonly HookParamDslEntry[] {
    const entries = operation.hookParams?.entries ?? [];
    const out: HookParamDslEntry[] = [];
    for (const entry of entries) {
        const parsed = parseHookParamSpec(entry.spec);
        if (!parsed.paramType) {
            continue;
        }
        out.push({
            name: entry.key,
            description: parsed.description,
            example: parsed.example,
            paramType: parsed.paramType
        });
    }
    return out;
}

export function listHookParamEntryNodes(operation: Operation): readonly HookParamEntry[] {
    return operation.hookParams?.entries ?? [];
}
