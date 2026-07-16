#!/usr/bin/env node
import { killListenersOnPort } from '../generated/api2ai/scripts/kill-listeners-on-port.mjs';

const PORT = Number(process.env.BOOKINGS_API_PORT) || 3847;
killListenersOnPort(PORT, { logPrefix: 'bookings:kill' });
