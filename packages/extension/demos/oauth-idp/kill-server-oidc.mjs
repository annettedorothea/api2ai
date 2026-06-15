#!/usr/bin/env node
import { killListenersOnPort } from '../scripts/generated/kill-listeners-on-port.mjs';

const PORT = Number(process.env.BOOKINGS_OAUTH_IDP_OIDC_PORT) || 3861;
killListenersOnPort(PORT, { logPrefix: 'oauth-idp-oidc:kill' });
