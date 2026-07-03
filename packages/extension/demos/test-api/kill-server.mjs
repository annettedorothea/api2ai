#!/usr/bin/env node
import { killListenersOnPort } from '../scripts/generated/kill-listeners-on-port.mjs';

const PORT = Number(process.env.TEST_API_PORT) || 3857;
killListenersOnPort(PORT, { logPrefix: 'test-api:kill' });
