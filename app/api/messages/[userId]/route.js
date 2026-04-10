import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DirectMessage from '@/models/DirectMessage';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(req, { params }) {
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

        const { userId: otherUserId } = params;

        if (!otherUserId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        // Verify the other user exists
        const otherUser = await User.findById(otherUserId).select('name role avatar');
        if (!otherUser) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Mark incoming unread messages as read
        await DirectMessage.updateMany(
            { sender: otherUserId, receiver: decoded.id, isRead: false },
            { $set: { isRead: true } }
        );

        // Fetch conversation history
        const messages = await DirectMessage.find({
            $or: [
                { sender: decoded.id, receiver: otherUserId },
                { sender: otherUserId, receiver: decoded.id },
            ],
        })
        .sort({ createdAt: 1 }) // Chronological order
        .lean();

        return NextResponse.json({ success: true, messages, otherUser });
    } catch (err) {
        console.error('Fetch messages error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
    }
}
