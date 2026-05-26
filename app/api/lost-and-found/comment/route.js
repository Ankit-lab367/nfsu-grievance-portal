export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LostAndFound from '@/models/LostAndFound';
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

export async function POST(request) {
    try {
        await connectDB();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { itemId, text } = body;

        if (!itemId || !text) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const item = await LostAndFound.findById(itemId);
        if (!item) {
            return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
        }

        const newComment = {
            user: user.name || 'Anonymous',
            avatar: user.avatar || null,
            text,
            timestamp: new Date()
        };

        item.comments.push(newComment);
        await item.save();

        return NextResponse.json({ success: true, comment: item.comments[item.comments.length - 1] }, { status: 201 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
