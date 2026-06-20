import type { ApiParamSpec, ApiParamSpecField } from './generated/ast.js';
import { isApiParamSpecField } from './generated/ast.js';

export type ParsedApiParamSpec = {
    description?: string;
    example?: string;
};

export function parseApiParamSpec(spec: ApiParamSpec | undefined): ParsedApiParamSpec {
    const out: ParsedApiParamSpec = {};
    if (!spec) {
        return out;
    }
    for (const field of spec.fields) {
        if (!isApiParamSpecField(field)) {
            continue;
        }
        if (field.description !== undefined) {
            out.description = String(field.description);
        }
        if (field.example !== undefined) {
            out.example = String(field.example);
        }
    }
    return out;
}

export function fieldKind(field: ApiParamSpecField): 'description' | 'example' | undefined {
    if (field.description !== undefined) {
        return 'description';
    }
    if (field.example !== undefined) {
        return 'example';
    }
    return undefined;
}

export function usedApiParamSpecFieldKinds(spec: ApiParamSpec | undefined): Set<string> {
    const used = new Set<string>();
    if (!spec) {
        return used;
    }
    for (const field of spec.fields) {
        const kind = fieldKind(field);
        if (kind) {
            used.add(kind);
        }
    }
    return used;
}

function schemaTypeFirst(schemaType: string | string[] | undefined): string | undefined {
    if (typeof schemaType === 'string') {
        return schemaType;
    }
    if (Array.isArray(schemaType) && schemaType.length > 0 && typeof schemaType[0] === 'string') {
        return schemaType[0];
    }
    return undefined;
}

export function parseExampleAgainstSchemaType(
    example: string,
    schemaType: string | string[] | undefined
): string | undefined {
    const trimmed = example.trim();
    if (trimmed.length === 0) {
        return '`example` must not be empty.';
    }
    const typeKind = schemaTypeFirst(schemaType) ?? 'string';
    switch (typeKind) {
        case 'string':
            return undefined;
        case 'integer': {
            const n = Number(trimmed);
            if (!Number.isInteger(n)) {
                return '`example` must be a valid integer for this OpenAPI parameter type.';
            }
            return undefined;
        }
        case 'number': {
            const n = Number(trimmed);
            if (!Number.isFinite(n)) {
                return '`example` must be a valid number for this OpenAPI parameter type.';
            }
            return undefined;
        }
        case 'boolean': {
            const lower = trimmed.toLowerCase();
            if (lower !== 'true' && lower !== 'false') {
                return '`example` must be "true" or "false" for this OpenAPI parameter type.';
            }
            return undefined;
        }
        case 'array': {
            try {
                const parsed = JSON.parse(trimmed) as unknown;
                if (!Array.isArray(parsed)) {
                    return '`example` must be a JSON array for this OpenAPI parameter type.';
                }
            } catch {
                return '`example` must be valid JSON for this OpenAPI parameter type.';
            }
            return undefined;
        }
        default:
            return undefined;
    }
}

export function coerceExampleFromSchemaType(
    example: string,
    schemaType: string | string[] | undefined
): string | number | boolean | unknown[] | undefined {
    const trimmed = example.trim();
    if (trimmed.length === 0) {
        return undefined;
    }
    const typeKind = schemaTypeFirst(schemaType) ?? 'string';
    switch (typeKind) {
        case 'integer':
            return Number.parseInt(trimmed, 10);
        case 'number':
            return Number(trimmed);
        case 'boolean':
            return trimmed.toLowerCase() === 'true';
        case 'array':
            try {
                const parsed = JSON.parse(trimmed) as unknown;
                return Array.isArray(parsed) ? parsed : undefined;
            } catch {
                return undefined;
            }
        default:
            return trimmed;
    }
}
