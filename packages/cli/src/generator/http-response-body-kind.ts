/**
 * Shared HTTP success-body classification for OpenAPI description hints and
 * generated decode helpers (must stay in sync).
 */

export const HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT = 5 * 1024 * 1024;

export const TOOLFACTORY_HTTP_BODY_MAX_BYTES_ENV = 'TOOLFACTORY_HTTP_BODY_MAX_BYTES';

export type HttpSuccessBodyKind = 'json' | 'textual' | 'binary';

export function parseMimeType(contentTypeHeader: string): string {
    const raw = contentTypeHeader.split(';')[0]?.trim().toLowerCase() ?? '';
    return raw;
}

export function isJsonMimeType(mime: string): boolean {
    return mime === 'application/json' || mime.endsWith('+json');
}

export function isTextualMimeType(mime: string): boolean {
    if (!mime) {
        return false;
    }
    if (mime.startsWith('text/')) {
        return true;
    }
    return (
        mime === 'application/xml' ||
        mime === 'application/javascript' ||
        mime === 'application/xhtml+xml' ||
        mime === 'application/x-www-form-urlencoded'
    );
}

/** Runtime rule: JSON → textual → everything else is binary (Base64 envelope). */
export function classifyHttpSuccessBodyKind(mime: string): HttpSuccessBodyKind {
    if (isJsonMimeType(mime)) {
        return 'json';
    }
    if (isTextualMimeType(mime)) {
        return 'textual';
    }
    return 'binary';
}

/**
 * True when invoke would return a Base64 binary envelope for this OpenAPI success response.
 * Schema `format: binary|byte` forces binary even without a content-type.
 */
export function isBinaryHttpSuccessResponse(
    schemaFormat: string | undefined,
    contentType: string | undefined
): boolean {
    if (schemaFormat === 'binary' || schemaFormat === 'byte') {
        return true;
    }
    if (!contentType) {
        return false;
    }
    const mime = parseMimeType(contentType);
    if (!mime) {
        return false;
    }
    return classifyHttpSuccessBodyKind(mime) === 'binary';
}

/** Source embedded into generated `*-tools.ts` (keep aligned with the TS helpers above). */
export function renderHttpSuccessMimeHelpersSource(): string {
    return `
function parseMimeType(contentTypeHeader: string): string {
    const raw = contentTypeHeader.split(';')[0]?.trim().toLowerCase() ?? '';
    return raw;
}

function isJsonMimeType(mime: string): boolean {
    return mime === 'application/json' || mime.endsWith('+json');
}

function isTextualMimeType(mime: string): boolean {
    if (!mime) {
        return false;
    }
    if (mime.startsWith('text/')) {
        return true;
    }
    return (
        mime === 'application/xml' ||
        mime === 'application/javascript' ||
        mime === 'application/xhtml+xml' ||
        mime === 'application/x-www-form-urlencoded'
    );
}
`.trim();
}

export function renderResolveHttpSuccessBodyMaxBytesSource(): string {
    return `
const HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT = ${HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT};

function resolveHttpSuccessBodyMaxBytes(): number {
    const raw = process.env.${TOOLFACTORY_HTTP_BODY_MAX_BYTES_ENV};
    if (raw === undefined || raw.trim().length === 0) {
        return HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT;
    }
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        return HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT;
    }
    return parsed;
}
`.trim();
}
