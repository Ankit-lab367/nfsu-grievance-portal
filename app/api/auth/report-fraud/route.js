import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(request) {
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
        
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        
        console.warn(`⚠️ SECURITY ALERT: User ${user.email} provided an unrecognized ID card pattern.`);
        
        return NextResponse.json({
            success: true,
            message: 'Access Denied: Unrecognized Identity Document.'
        });
        
    } catch (error) {
        console.error('Fraud report error:', error);
        return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
}
