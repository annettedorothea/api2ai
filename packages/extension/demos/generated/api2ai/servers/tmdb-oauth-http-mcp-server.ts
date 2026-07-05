#!/usr/bin/env node
/**
 * Generated MCP oauth-http host for tmdb (static tools import).
 */
import * as tools from '../tools/tmdb-tools.js';
import { runOAuthHttpMcp } from '../cli/oauth-http-runtime.js';

await runOAuthHttpMcp(tools, process.argv.slice(2));
