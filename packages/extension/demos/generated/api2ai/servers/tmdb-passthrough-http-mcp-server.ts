#!/usr/bin/env node
/**
 * Generated MCP passthrough-http host for tmdb (static tools import).
 */
import * as tools from '../tools/tmdb-tools.js';
import { runPassthroughHttpMcp } from '../cli/passthrough-http-runtime.js';

await runPassthroughHttpMcp(tools, process.argv.slice(2));
