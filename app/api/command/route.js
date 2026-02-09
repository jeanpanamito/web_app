import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, secret } = body;

    // Simple security check (In prod, use env vars)
    if (secret !== process.env.APP_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'SHUTDOWN') {
        await kv.set('shutdown_command', 'PENDING');
        return NextResponse.json({ status: 'Command Sent' });
    } 
    
    if (action === 'CANCEL') {
        await kv.del('shutdown_command');
        return NextResponse.json({ status: 'Command Cancelled' });
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(request) {
    // This endpoint is called by the PC
    const cmd = await kv.get('shutdown_command');
    
    if (cmd === 'PENDING') {
        // Clear command after reading so it doesn't loop? 
        // Better: client acknowledges. For simplicity: Auto-clear or keep for X seconds.
        // Let's Keep it, assuming PC clears it or we just return it and PC handles dedup.
        // To be safe: We read and delete (pop).
        await kv.del('shutdown_command');
        return NextResponse.json({ command: 'SHUTDOWN' });
    }
    
    return NextResponse.json({ command: 'NONE' });
}
