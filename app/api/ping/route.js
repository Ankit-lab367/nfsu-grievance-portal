import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch {
        return NextResponse.json({ ok: false }, { status: 200 });
    }
}