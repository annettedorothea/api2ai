import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function compileAuthStubSources(authDir: string): Promise<void> {
    if (!fs.existsSync(authDir)) {
        return;
    }
    const tsFiles = fs
        .readdirSync(authDir)
        .filter((name) => name.endsWith('.ts'))
        .map((name) => path.join(authDir, name));
    for (const tsPath of tsFiles) {
        const mjsPath = tsPath.replace(/\.ts$/, '.mjs');
        await esbuild.build({
            entryPoints: [tsPath],
            outfile: mjsPath,
            bundle: false,
            platform: 'node',
            format: 'esm',
            target: 'node20',
            logLevel: 'silent'
        });
    }
}
