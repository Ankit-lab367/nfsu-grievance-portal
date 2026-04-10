import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DirectMessage from '@/models/DirectMessage';
import User from '@/models/User';
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

        // 1. Find all distinct users the current user has interacted with
        const sentMessages = await DirectMessage.distinct('receiver', { sender: decoded.id });
        const receivedMessages = await DirectMessage.distinct('sender', { receiver: decoded.id });
        
        const allContactIds = [...new Set([...sentMessages.map(id => id.toString()), ...receivedMessages.map(id => id.toString())])];

        // 2. Fetch the latest message for each contact to build the conversation list
        const conversations = [];

        for (const contactId of allContactIds) {
            const latestMessage = await DirectMessage.findOne({
                $or: [
                    { sender: decoded.id, receiver: contactId },
                    { sender: contactId, receiver: decoded.id },
                ]
            }).sort({ createdAt: -1 }).lean();

            if (latestMessage) {
                // Determine if there are unread messages from this contact
                const unreadCount = await DirectMessage.countDocuments({
                    sender: contactId,
                    receiver: decoded.id,
                    isRead: false,
                });

                // Get contact user details
                const contactUser = await User.findById(contactId).select('name role avatar email').lean();

                if (contactUser && unreadCount > 0) {
                    conversations.push({
                        contact: contactUser,
                        latestMessage,
                        unreadCount,
                    });
                }
            }
        }

        // 3. Sort conversations by most recent message
        conversations.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

        return NextResponse.json({ success: true, conversations });
    } catch (err) {
        console.error('Fetch conversations error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
    }
}
