#!/usr/bin/env node
/**
 * Generated MCP oauth-http host for open-meteo-geocoding (static tools import).
 */
import * as tools from '../tools/open-meteo-geocoding-tools.js';
import { runOAuthHttpMcp } from '../cli/oauth-http-runtime.js';

await runOAuthHttpMcp(tools, process.argv.slice(2));
