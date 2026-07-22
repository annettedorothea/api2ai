#!/usr/bin/env node
/**
 * Generated MCP stdio host for open-meteo-geocoding (static tools import).
 */
import * as tools from '../tools/open-meteo-geocoding-tools.js';
import { defaultMcpEnvDirsFromMetaUrl, runStdioMcp } from '@toolfactory.dev/core/mcp-host';

await runStdioMcp(tools, process.argv.slice(2), defaultMcpEnvDirsFromMetaUrl(import.meta.url));
