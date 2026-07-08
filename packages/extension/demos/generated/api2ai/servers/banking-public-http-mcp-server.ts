#!/usr/bin/env node
/**
 * Generated MCP public-http host for banking (static tools import).
 */
import * as tools from '../tools/banking-tools.js';
import { runPublicHttpMcp } from '../cli/public-http-runtime.js';

await runPublicHttpMcp(tools, process.argv.slice(2));
