import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LostAndFound from '@/models/LostAndFound';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { del } from '@vercel/blob';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

export async function DELETE(req) {
    try {
        await connectDB();

        // 1. Authenticate user
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        
        const user = await User.findById(decoded.id);
        if (!user || user.role !== 'super-admin') {
            return NextResponse.json({ success: false, message: 'Forbidden. Only super-admins can delete resources.' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });
        }
        
        const item = await LostAndFound.findById(id);
        if (!item) {
            return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
        }
        
        if (item.image) {
            try {
                // Delete from Vercel Blob if it's a blob URL
                if (item.image.includes('public.blob.vercel-storage.com')) {
                    await del(item.image);
                }
            } catch (err) {
                console.error('File deletion error:', err);
            }
        }
        
        await LostAndFound.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
