#!/usr/bin/env node
/**
 * Generated MCP stdio host for github (static tools import).
 */
import * as tools from '../tools/github-tools.js';
import { runStdioMcp } from '../cli/stdio-runtime.js';

await runStdioMcp(tools, process.argv.slice(2));
