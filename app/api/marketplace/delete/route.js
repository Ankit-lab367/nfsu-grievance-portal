import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MarketplaceItem from '@/models/MarketplaceItem';
import User from '@/models/User';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
import { del } from '@vercel/blob';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

export async function DELETE(req) {
    try {
        await connectDB();

        const token = extractTokenFromRequest(req);
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
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
        
        const item = await MarketplaceItem.findById(id);
        if (!item) {
            return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
        }
        
        if (item.image) {
            try {
                
                if (item.image.includes('public.blob.vercel-storage.com')) {
                    await del(item.image);
                }
            } catch (err) {
                console.error('File deletion error:', err);
            }
        }
        
        await MarketplaceItem.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
