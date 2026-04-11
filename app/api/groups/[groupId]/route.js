import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatGroup from '@/models/ChatGroup';
import GroupMessage from '@/models/GroupMessage';
import { verifyToken, extractToken } from '@/lib/auth';

export async function DELETE(req, { params }) {
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

        const { groupId } = params;

        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        // Verify that the requester is the admin
        if (group.admin.toString() !== decoded.id) {
            return NextResponse.json({ success: false, error: 'Only the group creator can delete this group' }, { status: 403 });
        }

        // 1. Delete all messages associated with this group
        await GroupMessage.deleteMany({ groupId });

        // 2. Delete the group itself
        await ChatGroup.findByIdAndDelete(groupId);

        return NextResponse.json({ success: true, message: 'Group and all data deleted successfully' });
    } catch (err) {
        console.error('Delete group error:', err);
        return NextResponse.json({ success: false, error: 'Failed to delete group' }, { status: 500 });
    }
}
