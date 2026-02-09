import { createClient } from 'redis';
import { NextResponse } from 'next/server';

// Create Redis client
let redis = null;

async function getRedisClient() {
    if (!redis) {
        redis = createClient({ url: process.env.REDIS_URL });
        await redis.connect();
    }
    return redis;
}

export async function GET(request) {
    try {
        const client = await getRedisClient();
        const cmd = await client.get('shutdown_command');

        // Return the command without deleting it (read-only for polling)
        if (cmd === 'PENDING') {
            return NextResponse.json({ command: 'SHUTDOWN' });
        }

        return NextResponse.json({ command: 'NONE' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error: ' + error.message }, { status: 500 });
    }
}
