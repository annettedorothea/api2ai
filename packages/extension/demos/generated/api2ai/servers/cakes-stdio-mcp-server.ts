#!/usr/bin/env node
/**
 * Generated MCP stdio host for cakes (static tools import).
 */
import * as tools from '../tools/cakes-tools.js';
import { defaultMcpEnvDirsFromMetaUrl, runStdioMcp } from '@toolfactory.dev/core/mcp-host';

await runStdioMcp(tools, process.argv.slice(2), defaultMcpEnvDirsFromMetaUrl(import.meta.url));
