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

        // Get command history
        const historyStr = await client.get('command_history');
        const history = historyStr ? JSON.parse(historyStr) : [];

        // Get scheduled shutdown if exists
        const scheduledStr = await client.get('scheduled_shutdown');
        const scheduled = scheduledStr ? JSON.parse(scheduledStr) : null;

        return NextResponse.json({
            history,
            scheduled
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Internal Error: ' + error.message,
            history: [],
            scheduled: null
        }, { status: 500 });
    }
}
