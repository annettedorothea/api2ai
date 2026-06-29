#!/usr/bin/env node
/**
 * Stop native Open WebUI (listener on OPEN_WEBUI_PORT).
 * Usage: npm run open-webui:down
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';
import { killListenersOnPort } from './generated/kill-listeners-on-port.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

loadProjectEnvLocal();
const port = Number(process.env.OPEN_WEBUI_PORT ?? '3000');
killListenersOnPort(port, { logPrefix: 'open-webui:kill', nodeOnly: false });
console.log(`[open-webui] stopped (port ${port}, data kept in ${path.join(demosRoot, '.open-webui-data')}).`);
