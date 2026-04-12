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

// GET single item by ID
export async function GET(request, { params }) {
    try {
        await connectDB();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const item = await MarketplaceItem.findById(params.id).lean();
        if (!item) {
            return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, item });
    } catch (error) {
        console.error('Error fetching item:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH — mark item as sold
export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { status } = await request.json();
        const item = await MarketplaceItem.findByIdAndUpdate(
            params.id,
            { status: status || 'sold' },
            { new: true }
        );
        if (!item) {
            return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, item });
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
