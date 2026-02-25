import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Complaint from '@/models/Complaint';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id } = params;

        // Try to find by MongoDB _id or complaintId
        const complaint = await Complaint.findOne({
            $or: [{ _id: id }, { complaintId: id }],
        })
            .populate('userId', 'name email enrollmentNumber phone')
            .populate('assignedTo', 'name email')
            .populate('timeline.updatedBy', 'name role')
            .populate('resolutionDetails.resolvedBy', 'name email');

        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        // Increment view count
        complaint.viewCount += 1;
        await complaint.save();

        // Check authorization if authenticated
        const token = extractToken(request.headers.get('authorization'));
        if (token) {
            const decoded = verifyToken(token);

            if (decoded) {
                // Students can only view their own complaints
                if (decoded.role === 'student' && complaint.userId._id.toString() !== decoded.id) {
                    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
                }
            }
        }

        return NextResponse.json(
            {
                success: true,
                complaint,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get complaint error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch complaint' },
            { status: 500 }
        );
    }
}
