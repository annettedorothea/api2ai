import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { InvokeOptions } from '../../../../generated/api2ai/tools/todo-tools.js';

type BinaryEnvelope = {
    kind: 'binary';
    encoding: 'base64';
    contentType: string;
    byteLength: number;
    data: string;
    filename?: string;
};

function isBinaryEnvelope(value: unknown): value is BinaryEnvelope {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const v = value as Record<string, unknown>;
    return (
        v.kind === 'binary' &&
        v.encoding === 'base64' &&
        typeof v.contentType === 'string' &&
        typeof v.byteLength === 'number' &&
        typeof v.data === 'string'
    );
}

/**
 * afterToolCall for exportTodosPdf — write PDF bytes to OS temp and return path metadata (no Base64).
 */
export function afterToolCallForExportTodosPdf(result: unknown, options: InvokeOptions, credential: string): unknown {
    void options;
    void credential;
    if (!isBinaryEnvelope(result)) {
        throw new Error(
            'afterToolCallForExportTodosPdf expected a binary Base64 envelope from decodeHttpSuccessResponse'
        );
    }
    const dir = path.join(os.tmpdir(), 'toolfactory-todo-exports');
    fs.mkdirSync(dir, { recursive: true });
    const safeName =
        typeof result.filename === 'string' && result.filename.trim().length > 0
            ? path.basename(result.filename.trim())
            : 'todos.pdf';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(dir, `${stamp}-${safeName}`);
    fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
    return {
        kind: 'binary',
        contentType: result.contentType,
        filename: safeName,
        byteLength: result.byteLength,
        path: filePath,
        saved: true
    };
}
