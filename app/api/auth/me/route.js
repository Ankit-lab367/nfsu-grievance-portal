import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';
export async function GET(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }
        const user = await User.findById(decoded.id).populate('departmentId');
        if (!user || !user.isActive) {
            return NextResponse.json(
                { error: 'User not found or inactive' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    enrollmentNumber: user.enrollmentNumber,
                    course: user.course,
                    year: user.year,
                    phone: user.phone,
                    departmentId: user.departmentId,
                    permissions: user.permissions,
                    avatar: user.avatar,
                    lastLogin: user.lastLogin,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
        );
    }
}