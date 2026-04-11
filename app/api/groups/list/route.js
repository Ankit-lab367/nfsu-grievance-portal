import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatGroup from '@/models/ChatGroup';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(req) {
    try {
        const token = extractToken(req.headers.get('Authorization'));
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
        }

        await dbConnect();

        // Find all groups where the user is a member
        const groups = await ChatGroup.find({ members: decoded.id })
            .select('name members admin avatar createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, groups });
    } catch (err) {
        console.error('Fetch groups error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch groups' }, { status: 500 });
    }
}
