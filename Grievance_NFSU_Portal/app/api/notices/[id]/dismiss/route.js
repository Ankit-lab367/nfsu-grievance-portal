import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notice from '@/models/Notice';
import jwt from 'jsonwebtoken';

// DB Connection helper
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

// Helper middleware to get user from token
async function getUserFromToken(request) {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function POST(request, { params }) {
    try {
        await connectDB();
        const user = await getUserFromToken(request);
        const { id } = params;

        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Add user ID to dismissedBy array if not already there
        const notice = await Notice.findByIdAndUpdate(
            id,
            { $addToSet: { dismissedBy: user.id } },
            { new: true }
        );

        if (!notice) {
            return NextResponse.json({ success: false, message: 'Notice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Notice dismissed' });

    } catch (error) {
        console.error('Error dismissing notice:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
