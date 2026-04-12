export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MarketplaceItem from '@/models/MarketplaceItem';
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

        const item = await MarketplaceItem.findById(itemId);
        if (!item) {
            return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
        }

        const newMessage = {
            user: user.name || 'Anonymous',
            avatar: user.avatar || null,
            text,
            timestamp: new Date()
        };

        item.messages.push(newMessage);
        await item.save();

        return NextResponse.json({ success: true, message: item.messages[item.messages.length - 1] }, { status: 201 });
    } catch (error) {
        console.error('Error adding message:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
