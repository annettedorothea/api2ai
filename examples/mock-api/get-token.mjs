#!/usr/bin/env node
/**
 * Fetch JWT for a demo customer: node get-token.mjs alice
 * Set MOCK_API_ACCESS_TOKEN in examples/.env.local to use with MCP.
 */
const customerId = process.argv[2];
if (!customerId) {
    console.error('Usage: node get-token.mjs <customerId>  (demo customers: alice, bob)');
    process.exit(1);
}

const port = process.env.MOCK_API_PORT || '3847';
const base = process.env.MOCK_API_BASE_URL?.replace(/\/$/u, '') || `http://127.0.0.1:${port}`;
const url = `${base}/login/${encodeURIComponent(customerId)}`;

const res = await fetch(url, { method: 'POST' });
if (!res.ok) {
    const text = await res.text();
    console.error(`Login failed HTTP ${res.status}: ${text}`);
    process.exit(1);
}
const body = await res.json();
if (!body.access_token) {
    console.error('No access_token in response');
    process.exit(1);
}
console.log(body.access_token);
