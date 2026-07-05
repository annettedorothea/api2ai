#!/usr/bin/env node
/**
 * Generated MCP stdio host for spaceflight-news (static tools import).
 */
import * as tools from '../tools/spaceflight-news-tools.js';
import { runStdioMcp } from '../cli/stdio-runtime.js';

await runStdioMcp(tools, process.argv.slice(2));
