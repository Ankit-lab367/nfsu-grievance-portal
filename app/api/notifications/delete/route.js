import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { verifyToken, extractToken } from '@/lib/auth';
export async function DELETE(request) {
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
        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');
        const clearAll = searchParams.get('all') === 'true';
        if (clearAll) {
            await Notification.deleteMany({ userId: decoded.id });
            return NextResponse.json({ success: true, message: 'All notifications cleared' });
        }
        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }
        const result = await Notification.deleteOne({ _id: notificationId, userId: decoded.id });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function PATCH(request) {
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
        const { notificationId } = await request.json();
        if (notificationId === 'all') {
            await Notification.updateMany({ userId: decoded.id }, { isRead: true });
        } else {
            await Notification.findOneAndUpdate({ _id: notificationId, userId: decoded.id }, { isRead: true });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}