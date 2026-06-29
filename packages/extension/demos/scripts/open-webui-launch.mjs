/**
 * Resolve how to invoke native Open WebUI (pip / python -m).
 */
import { spawnSync } from 'node:child_process';

/**
 * @param {number} port
 * @returns {{ command: string, args: string[] } | null}
 */
export function resolveOpenWebUiLaunch(port) {
    const serveArgs = ['serve', '--port', String(port)];
    if (spawnSync('open-webui', ['--help'], { stdio: 'ignore' }).status === 0) {
        return { command: 'open-webui', args: serveArgs };
    }
    for (const python of ['python3', 'python']) {
        if (spawnSync(python, ['-m', 'open_webui', '--help'], { stdio: 'ignore' }).status === 0) {
            return { command: python, args: ['-m', 'open_webui', ...serveArgs] };
        }
    }
    return null;
}

export function printOpenWebUiInstallHint() {
    console.error('[open-webui] Open WebUI is not installed.');
    console.error('[open-webui] Install (Python 3.11+ recommended):');
    console.error('  python3 -m pip install open-webui');
    console.error('  # or venv: python3 -m venv .open-webui-venv && source .open-webui-venv/bin/activate && python3 -m pip install open-webui');
    console.error('[open-webui] On macOS, use python3 -m pip — bare pip may be broken (/usr/bin/python missing).');
    console.error('[open-webui] Then retry: npm run open-webui');
}
