import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request) {
    try {
        await dbConnect();
        
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const decoded = verifyToken(token);
        const adminUser = await User.findById(decoded.id);
        if (!adminUser || adminUser.role !== 'super-admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const user = await User.findById(userId).select('name email role');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
