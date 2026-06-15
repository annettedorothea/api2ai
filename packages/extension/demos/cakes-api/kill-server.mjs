#!/usr/bin/env node
import { killListenersOnPort } from '../scripts/generated/kill-listeners-on-port.mjs';

const PORT = Number(process.env.CAKES_API_PORT) || 3856;
killListenersOnPort(PORT, { logPrefix: 'cakes-api:kill' });
