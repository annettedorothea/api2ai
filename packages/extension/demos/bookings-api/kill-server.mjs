#!/usr/bin/env node
import { killListenersOnPort } from '../scripts/generated/kill-listeners-on-port.mjs';

const PORT = Number(process.env.BOOKINGS_API_PORT) || 3847;
killListenersOnPort(PORT, { logPrefix: 'bookings-api:kill' });
