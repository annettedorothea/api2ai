#!/usr/bin/env node
import { killListenersOnPort } from '../scripts/generated/kill-listeners-on-port.mjs';

const PORT = Number(process.env.ENTERPRISE_IDP_PORT) || 3862;
killListenersOnPort(PORT, { logPrefix: 'enterprise-idp:kill' });
