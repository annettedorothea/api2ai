#!/usr/bin/env node
import { execSync } from 'node:child_process';

const PORT = Number(process.env.TODO_API_PORT) || 3852;

try {
    const pids = execSync(`lsof -ti :${PORT}`, { encoding: 'utf8' }).trim();
    if (!pids) {
        console.log(`[todo-api:kill] port ${PORT}: nothing listening`);
        process.exit(0);
    }
    for (const pid of pids.split('\n').filter(Boolean)) {
        execSync(`kill ${pid}`);
    }
    console.log(`[todo-api:kill] port ${PORT}: stopped ${pids.replace(/\n/g, ', ')}`);
} catch (err) {
    const status = err && typeof err === 'object' && 'status' in err ? err.status : undefined;
    if (status === 1) {
        console.log(`[todo-api:kill] port ${PORT}: nothing listening`);
        process.exit(0);
    }
    throw err;
}
