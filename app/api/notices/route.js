import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notice from '@/models/Notice';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};
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
export async function GET(request) {
    try {
        await connectDB();
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        let query = {};
        if (user.role === 'student') {
            query = {
                targetAudience: { $in: ['student', 'both'] },
                dismissedBy: { $ne: user.id } 
            };
        } else if (['admin', 'super-admin', 'staff', 'teacher'].includes(user.role)) {
            query = {
                targetAudience: { $in: ['staff', 'both'] },
                dismissedBy: { $ne: user.id }
            };
        } else {
            query = { targetAudience: 'none' };
        }
        const notices = await Notice.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'name role');
        return NextResponse.json({ success: true, notices });
    } catch (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        await connectDB();
        const user = await getUserFromToken(request);
        if (!user || !['admin', 'super-admin', 'staff', 'teacher'].includes(user.role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized. Staff only.' }, { status: 403 });
        }
        const { title, content, targetAudience } = await request.json();
        if (!title || !content || !targetAudience) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        if (!['student', 'staff', 'both'].includes(targetAudience)) {
            return NextResponse.json({ success: false, message: 'Invalid target audience' }, { status: 400 });
        }
        const newNotice = await Notice.create({
            title,
            content,
            targetAudience,
            author: user.id,
        });
        return NextResponse.json({ success: true, notice: newNotice, message: 'Notice created successfully' });
    } catch (error) {
        console.error('Error creating notice:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}