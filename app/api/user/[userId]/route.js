import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(req, { params }) {
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

        const { userId } = params;

        // Fetch basic public info
        const user = await User.findById(userId).select('-password -permissions -phone -lastLogin');
        
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (err) {
        console.error('Fetch public profile error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch user profile' }, { status: 500 });
    }
}
