#!/usr/bin/env node
import { killListenersOnPort } from '../generated/api2ai/scripts/kill-listeners-on-port.mjs';

const PORT = Number(process.env.TODO_API_PORT) || 3852;
killListenersOnPort(PORT, { logPrefix: 'todo-api:kill' });
