#!/usr/bin/env node
/**
 * Generated MCP public-http host for open-meteo-geocoding (static tools import).
 */
import * as tools from '../tools/open-meteo-geocoding-tools.js';
import { runPublicHttpMcp } from '../cli/public-http-runtime.js';

await runPublicHttpMcp(tools, process.argv.slice(2));
