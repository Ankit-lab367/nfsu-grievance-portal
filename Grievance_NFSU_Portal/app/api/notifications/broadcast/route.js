import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();

        // Authenticate user doing the action
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { type, title, message, link } = await request.json();

        if (!type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch all active users (you might want to exclude blocked users)
        const allUsers = await User.find({ isBlocked: { $ne: true } }).select('_id');

        if (allUsers.length === 0) {
            return NextResponse.json({ success: true, message: 'No users to notify' });
        }

        // Prepare notifications for standard insertMany
        const notificationsToInsert = allUsers.map(u => ({
            userId: u._id,
            type, // Must match Notification schema enum ('complaint', 'status_update', 'assignment', 'resolution', 'escalation', 'feedback')
            title,
            message,
            link: link || '',
        }));

        await Notification.insertMany(notificationsToInsert);

        return NextResponse.json({ success: true, message: 'Broadcast notification sent successfully' }, { status: 201 });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to broadcast notification' },
            { status: 500 }
        );
    }
}
