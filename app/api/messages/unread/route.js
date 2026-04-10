import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DirectMessage from '@/models/DirectMessage';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(req) {
    try {
        const token = extractToken(req.headers.get('Authorization'));
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
        }

        await dbConnect();

        // Count unread messages where the current user is the receiver
        const totalUnread = await DirectMessage.countDocuments({
            receiver: decoded.id,
            isRead: false,
        });

        // Get list of distinct senders who have unread messages for the current user
        const unreadPublishers = await DirectMessage.distinct('sender', {
            receiver: decoded.id,
            isRead: false,
        });

        return NextResponse.json({ success: true, count: totalUnread, unreadSenders: unreadPublishers });
    } catch (err) {
        console.error('Fetch unread messages error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch unread count' }, { status: 500 });
    }
}
