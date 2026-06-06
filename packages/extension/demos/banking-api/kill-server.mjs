#!/usr/bin/env node
import { killListenersOnPort } from '../scripts/kill-listeners-on-port.mjs';

const PORT = Number(process.env.BANKING_API_PORT) || 3858;
killListenersOnPort(PORT, { logPrefix: 'banking-api:kill' });
