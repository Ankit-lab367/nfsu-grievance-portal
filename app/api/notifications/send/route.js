import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';
export async function POST(request) {
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
        const { targetUserId, type, title, message, link } = await request.json();
        if (!targetUserId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
        }
        const newNotification = await Notification.create({
            userId: targetUserId,
            type, 
            title,
            message,
            link: link || '',
        });
        return NextResponse.json({ success: true, notification: newNotification }, { status: 201 });
    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send notification' },
            { status: 500 }
        );
    }
}