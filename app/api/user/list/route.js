import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
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

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const query = {
            _id: { $ne: decoded.id },
            isActive: true,
            role: { $ne: 'super-admin' },
        };

        if (search.trim()) {
            query.name = { $regex: search.trim(), $options: 'i' };
        }

        const users = await User.find(query)
            .select('name role avatar email enrollmentNumber')
            .sort({ name: 1 })
            .limit(100)
            .lean();

        return NextResponse.json({ success: true, users });
    } catch (err) {
        console.error('User list error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}
