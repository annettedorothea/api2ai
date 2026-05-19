#!/usr/bin/env node
/**
 * Seal / unseal short bearer secrets (e.g. GitHub PAT) for bearerSealed + sealedCredential flow.
 * Wire format v1: see seal-bearer-wire-format.md in this directory.
 *
 * Usage:
 *   node examples/scripts/seal-bearer-helper.mjs gen-keypair --out examples/seal-keys
 *   node examples/scripts/seal-bearer-helper.mjs seal --public-key examples/seal-keys/public.pem --pat ghp_...
 *   npm run seal:github-token --prefix examples -- --pat ghp_...   (repo root)
 *   cd examples && npm run seal:github-token -- --pat ghp_...
 *   npm run seal:token --prefix examples -- eyJ...                 (Bearer JWT as positional)
 *   cd examples && npm run seal:token -- --token eyJ...
 *   node examples/scripts/seal-bearer-helper.mjs verify --private-key examples/seal-keys/private.pem --blob "<base64>"
 *
 * Prefer --stdin over --pat where possible: a PAT on the command line can appear in shell history and `ps`.
 */

import {
    constants,
    createCipheriv,
    createDecipheriv,
    generateKeyPairSync,
    privateDecrypt,
    publicEncrypt,
    randomBytes
} from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';

const MAGIC = Buffer.from('A2S1', 'ascii');
const AES_KEY_LEN = 32;
const IV_LEN = 12;
const TAG_LEN = 16;

function readFlagValue(argv, i, flagName) {
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) {
        console.error(`Missing value after ${flagName} (or value looks like another flag).`);
        process.exit(1);
    }
    return v;
}

function parseArgs(argv) {
    const out = { cmd: argv[2], flags: {}, positionals: [] };
    for (let i = 3; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--out') {
            out.flags.out = readFlagValue(argv, i, a);
            i++;
        } else if (a === '--public-key') {
            out.flags.publicKey = readFlagValue(argv, i, a);
            i++;
        } else if (a === '--private-key') {
            out.flags.privateKey = readFlagValue(argv, i, a);
            i++;
        } else if (a === '--pat' || a === '--token') {
            out.flags.pat = readFlagValue(argv, i, a);
            i++;
        } else if (a === '--blob') {
            out.flags.blob = readFlagValue(argv, i, a);
            i++;
        } else if (a === '--stdin') {
            out.flags.stdin = true;
        } else if (a.startsWith('--')) {
            console.error('Unknown arg:', a);
            process.exit(1);
        } else {
            out.positionals.push(a);
        }
    }
    return out;
}

function sealV1(plaintextUtf8, publicKeyPem) {
    const aesKey = randomBytes(AES_KEY_LEN);
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv('aes-256-gcm', aesKey, iv, { authTagLength: TAG_LEN });
    const enc = Buffer.concat([cipher.update(plaintextUtf8, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const aesPayload = Buffer.concat([enc, tag]);

    const rsaCipher = publicEncrypt(
        {
            key: publicKeyPem,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        aesKey
    );

    const rsaLen = rsaCipher.length;
    if (rsaLen > 0xffff) {
        throw new Error('RSA ciphertext unexpectedly long');
    }
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16BE(rsaLen, 0);

    return Buffer.concat([MAGIC, lenBuf, rsaCipher, iv, aesPayload]);
}

function unsealV1(blob, privateKeyPem) {
    if (blob.length < MAGIC.length + 2 + IV_LEN + TAG_LEN) {
        throw new Error('Blob too short');
    }
    if (!blob.subarray(0, MAGIC.length).equals(MAGIC)) {
        throw new Error('Bad magic (expected A2S1 wire v1)');
    }
    let o = MAGIC.length;
    const rsaLen = blob.readUInt16BE(o);
    o += 2;
    const rsaCipher = blob.subarray(o, o + rsaLen);
    o += rsaLen;
    const iv = blob.subarray(o, o + IV_LEN);
    o += IV_LEN;
    const aesPayload = blob.subarray(o);
    if (aesPayload.length < TAG_LEN) {
        throw new Error('Truncated AES payload');
    }
    const tag = aesPayload.subarray(aesPayload.length - TAG_LEN);
    const enc = aesPayload.subarray(0, aesPayload.length - TAG_LEN);

    const aesKey = privateDecrypt(
        {
            key: privateKeyPem,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        rsaCipher
    );

    const decipher = createDecipheriv('aes-256-gcm', aesKey, iv, { authTagLength: TAG_LEN });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

async function readStdinSecret() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    const lines = [];
    for await (const line of rl) {
        lines.push(line);
    }
    return lines.join('\n').trim();
}

function cmdGenKeypair(flags) {
    const outDir = flags.out;
    if (!outDir) {
        console.error('Missing --out <directory>');
        process.exit(1);
    }
    fs.mkdirSync(outDir, { recursive: true });
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const pubPath = path.join(outDir, 'public.pem');
    const privPath = path.join(outDir, 'private.pem');
    fs.writeFileSync(pubPath, publicKey, { mode: 0o600 });
    fs.writeFileSync(privPath, privateKey, { mode: 0o600 });
    console.error(`Wrote ${pubPath} and ${privPath} (mode 600). Do not commit private.pem.`);
}

async function cmdSeal(flags, positionals) {
    const pubPath = flags.publicKey;
    if (!pubPath) {
        console.error('Missing --public-key <path>');
        process.exit(1);
    }
    const secretSources = [
        flags.pat !== undefined,
        flags.stdin,
        positionals.length > 0
    ].filter(Boolean).length;
    if (secretSources > 1) {
        console.error('Use only one of --pat/--token, a single positional secret, or --stdin.');
        process.exit(1);
    }
    const publicKeyPem = fs.readFileSync(pubPath, 'utf8');
    let secret;
    if (flags.pat !== undefined) {
        secret = String(flags.pat).trim();
    } else if (positionals.length === 1) {
        secret = String(positionals[0]).trim();
    } else if (positionals.length > 1) {
        console.error('Multiple positional secrets; pass one token or use --pat/--token once.');
        process.exit(1);
    } else if (flags.stdin) {
        secret = await readStdinSecret();
    } else {
        console.error(
            'Provide the secret with --pat <token>, --token <jwt>, one positional argument, or --stdin (pipe).'
        );
        process.exit(1);
    }
    if (!secret) {
        console.error('Secret is empty after trim.');
        process.exit(1);
    }
    const buf = sealV1(secret, publicKeyPem);
    process.stdout.write(buf.toString('base64') + '\n');
}

function cmdVerify(flags) {
    const privPath = flags.privateKey;
    const b64 = flags.blob;
    if (!privPath || !b64) {
        console.error('Missing --private-key or --blob');
        process.exit(1);
    }
    const privateKeyPem = fs.readFileSync(privPath, 'utf8');
    const blob = Buffer.from(b64.trim(), 'base64');
    const pt = unsealV1(blob, privateKeyPem);
    process.stdout.write(pt + '\n');
}

const { cmd, flags, positionals } = parseArgs(process.argv);

if (cmd === 'gen-keypair') {
    cmdGenKeypair(flags);
} else if (cmd === 'seal') {
    await cmdSeal(flags, positionals);
} else if (cmd === 'verify') {
    cmdVerify(flags);
} else {
    console.error(`Usage:
  node examples/scripts/seal-bearer-helper.mjs gen-keypair --out <dir>
  node examples/scripts/seal-bearer-helper.mjs seal --public-key <public.pem> (--pat|--token <secret> | <secret> | --stdin)
  node examples/scripts/seal-bearer-helper.mjs verify --private-key <private.pem> --blob <base64>

  npm examples:
  npm run seal:github-token -- --pat ghp_...
  npm run seal:token -- eyJ...`);
    process.exit(1);
}
