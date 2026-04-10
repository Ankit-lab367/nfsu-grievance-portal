import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { verifyToken, extractToken } from '@/lib/auth';
export async function GET(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const notifications = await Notification.find({ userId: decoded.id })
            .sort({ createdAt: -1 })
            .limit(50);
        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}