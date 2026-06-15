#!/usr/bin/env node
import { killListenersOnPort } from '../scripts/generated/kill-listeners-on-port.mjs';

const PORT = Number(process.env.BOOKINGS_OAUTH_IDP_PORT) || 3860;
killListenersOnPort(PORT, { logPrefix: 'oauth-idp:kill' });
