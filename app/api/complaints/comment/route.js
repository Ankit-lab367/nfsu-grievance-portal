export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Complaint from '@/models/Complaint';
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
        const { complaintId, text } = body;

        if (!complaintId || !text) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return NextResponse.json({ success: false, message: 'Complaint not found' }, { status: 404 });
        }

        const newComment = {
            user: user.name || 'Anonymous',
            avatar: user.avatar || null,
            text,
            timestamp: new Date()
        };

        complaint.comments.push(newComment);
        await complaint.save();

        return NextResponse.json({ success: true, comment: complaint.comments[complaint.comments.length - 1] }, { status: 201 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
