export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LostAndFound from '@/models/LostAndFound';
import jwt from 'jsonwebtoken';
import { put } from '@vercel/blob';

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

// GET all active lost & found items
export async function GET(request) {
    try {
        await connectDB();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const items = await LostAndFound.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error('Error fetching lost & found items:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST a new lost & found item
export async function POST(request) {
    try {
        await connectDB();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { subject, description, type, location, image } = body;

        if (!subject || !description || !type || !location) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        if (!['lost', 'found'].includes(type)) {
            return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });
        }

        let imageUrl = null;
        if (image) {
            const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (match) {
                const ext = match[1];
                const base64Data = match[2];
                const buffer = Buffer.from(base64Data, 'base64');
                const filename = `lost-found-${Date.now()}.${ext}`;
                const { url } = await put(filename, buffer, {
                    access: 'public',
                    contentType: `image/${ext}`
                });
                imageUrl = url;
            } else if (image.startsWith('http')) {
                 imageUrl = image;
            }
        }

        const newItem = await LostAndFound.create({
            subject,
            description,
            type,
            location,
            image: imageUrl,
            uploaderId: user.email || user.id,
            uploaderName: user.name || 'Anonymous'
        });

        return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    } catch (error) {
        console.error('Error creating lost & found item:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
