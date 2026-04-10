import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        
        // Get token from headers
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
        
        // Update verification status
        user.isVerifiedID = true;
        await user.save();
        
        return NextResponse.json({
            success: true,
            message: 'ID Verified successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerifiedID: user.isVerifiedID
            }
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
