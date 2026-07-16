#!/usr/bin/env node
import { killListenersOnPort } from '../generated/api2ai/scripts/kill-listeners-on-port.mjs';

const PORT = Number(process.env.BOOKINGS_OAUTH_IDP_PORT) || 3860;
killListenersOnPort(PORT, { logPrefix: 'oauth-idp:kill' });
