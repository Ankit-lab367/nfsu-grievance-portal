import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DirectMessage from '@/models/DirectMessage';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(req) {
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

        const { receiverId, content } = await req.json();

        if (!receiverId || !content || !content.trim()) {
            return NextResponse.json({ success: false, error: 'Receiver ID and content are required' }, { status: 400 });
        }

        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return NextResponse.json({ success: false, error: 'Receiver not found' }, { status: 404 });
        }
        
        // Ensure sender and receiver are not the same
        if (decoded.id === receiverId) {
             return NextResponse.json({ success: false, error: 'Cannot send message to yourself' }, { status: 400 });
        }

        const message = await DirectMessage.create({
            sender: decoded.id,
            receiver: receiverId,
            content: content.trim(),
            isRead: false,
        });

        return NextResponse.json({ success: true, message });
    } catch (err) {
        console.error('Send message error:', err);
        return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }
}
