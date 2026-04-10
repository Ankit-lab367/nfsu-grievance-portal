import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request) {
    try {
        await dbConnect();
        
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
        
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const user = await User.findById(decoded.id).select('isActive role');
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            isActive: user.isActive,
            role: user.role
        });

    } catch (error) {
        console.error('Check-status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
