#!/usr/bin/env node
/**
 * Generated MCP stdio host for open-meteo-geocoding (static tools import).
 */
import * as tools from '../tools/open-meteo-geocoding-tools.js';
import { runStdioMcp } from '../cli/stdio-runtime.js';

await runStdioMcp(tools, process.argv.slice(2));
