import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notice from '@/models/Notice';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};
async function getUserFromToken(request) {
    const token = extractTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}
export async function POST(request, { params }) {
    try {
        await connectDB();
        const user = await getUserFromToken(request);
        const { id } = params;
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
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