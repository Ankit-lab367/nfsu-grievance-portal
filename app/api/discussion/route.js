export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import DiscussionMessage from '@/models/DiscussionMessage';
import jwt from 'jsonwebtoken';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

function getUserFromToken(request) {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

// GET messages for a specific forum type
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
            .sort({ createdAt: 1 }) // Older first
            .lean();

        return NextResponse.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST a new message
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
