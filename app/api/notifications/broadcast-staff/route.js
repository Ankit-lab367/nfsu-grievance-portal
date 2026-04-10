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
        const { type, title, message, link } = await request.json();
        if (!type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const staffUsers = await User.find({
            isBlocked: { $ne: true },
            role: { $in: ['admin', 'staff', 'super-admin'] }
        }).select('_id');
        if (staffUsers.length === 0) {
            return NextResponse.json({ success: true, message: 'No staff members to notify' });
        }
        const notificationsToInsert = staffUsers.map(u => ({
            userId: u._id,
            type,
            title,
            message,
            link: link || '',
        }));
        await Notification.insertMany(notificationsToInsert);
        return NextResponse.json({ success: true, message: 'Staff broadcast notification sent successfully' }, { status: 201 });
    } catch (error) {
        console.error('Staff broadcast notification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to broadcast notification' },
            { status: 500 }
        );
    }
}