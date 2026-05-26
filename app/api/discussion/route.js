export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import DiscussionMessage from '@/models/DiscussionMessage';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

function getUserFromToken(request) {
    const token = extractTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}


export async function GET(request) {
    try {
        await connectDB();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const forumType = searchParams.get('type') || 'student';

        const messages = await DiscussionMessage.find({ forumType })
            .sort({ createdAt: 1 }) 
            .lean();

        return NextResponse.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(request) {
    try {
        await connectDB();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { text, forumType } = body;

        if (!text || !forumType) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const newMessage = await DiscussionMessage.create({
            forumType,
            text,
            senderName: user.name || 'Anonymous',
            senderEmail: user.email || 'unknown',
            senderAvatar: user.avatar || null
        });

        return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
