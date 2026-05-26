import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LostAndFound from '@/models/LostAndFound';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

function getUserFromToken(request) {
    const token = extractTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}


export async function GET(request, { params }) {
    try {
        await dbConnect();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const item = await LostAndFound.findById(params.id).lean();
        if (!item) {
            return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, item });
    } catch (error) {
        console.error('Error fetching item:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { status } = await request.json();
        const item = await LostAndFound.findByIdAndUpdate(
            params.id,
            { status: status || 'resolved' },
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
