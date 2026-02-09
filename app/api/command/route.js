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

// Helper function to add command to history
async function addToHistory(client, commandData) {
  try {
    // Get existing history
    const historyStr = await client.get('command_history');
    let history = historyStr ? JSON.parse(historyStr) : [];

    // Add new command at the beginning
    history.unshift(commandData);

    // Keep only last 10 commands
    if (history.length > 10) {
      history = history.slice(0, 10);
    }

    // Save back to Redis
    await client.set('command_history', JSON.stringify(history));
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, secret, scheduledTime } = body;

    // Normalize strings to avoid whitespace issues
    const validSecret = process.env.APP_SECRET ? process.env.APP_SECRET.trim() : "";
    const inputSecret = secret ? secret.toString().trim() : "";

    // Debug: Check if Env Var is missing on server
    if (!validSecret) {
      return NextResponse.json({ error: 'Server Config Error: APP_SECRET not set' }, { status: 500 });
    }

    if (inputSecret !== validSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getRedisClient();
    const timestamp = new Date().toISOString();

    if (action === 'SHUTDOWN') {
      await client.set('shutdown_command', 'PENDING');

      // Add to command history
      await addToHistory(client, {
        action: 'SHUTDOWN',
        timestamp,
        status: 'sent'
      });

      return NextResponse.json({ status: 'Command Sent', timestamp });
    }

    if (action === 'SCHEDULE') {
      if (!scheduledTime) {
        return NextResponse.json({ error: 'Missing scheduled time' }, { status: 400 });
      }

      const scheduledDate = new Date(scheduledTime);
      const now = new Date();

      if (scheduledDate <= now) {
        return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 });
      }

      // Store scheduled shutdown
      await client.set('scheduled_shutdown', JSON.stringify({
        targetTime: scheduledTime,
        createdAt: timestamp,
        status: 'scheduled'
      }));

      await addToHistory(client, {
        action: 'SCHEDULE',
        timestamp,
        scheduledTime,
        status: 'scheduled'
      });

      return NextResponse.json({
        status: 'Shutdown Scheduled',
        scheduledTime,
        timestamp
      });
    }

    if (action === 'CANCEL') {
      await client.del('shutdown_command');
      await client.del('scheduled_shutdown');

      await addToHistory(client, {
        action: 'CANCEL',
        timestamp,
        status: 'cancelled'
      });

      return NextResponse.json({ status: 'Command Cancelled', timestamp });
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Error: ' + error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // This endpoint is called by the PC
    const client = await getRedisClient();
    const cmd = await client.get('shutdown_command');

    if (cmd === 'PENDING') {
      // Clear command after reading so it doesn't loop? 
      // Better: client acknowledges. For simplicity: Auto-clear or keep for X seconds.
      // Let's Keep it, assuming PC clears it or we just return it and PC handles dedup.
      // To be safe: We read and delete (pop).
      await client.del('shutdown_command');
      return NextResponse.json({ command: 'SHUTDOWN' });
    }

    return NextResponse.json({ command: 'NONE' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error: ' + error.message }, { status: 500 });
  }
}
