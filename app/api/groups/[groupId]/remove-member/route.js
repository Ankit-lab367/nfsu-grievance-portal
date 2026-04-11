import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatGroup from '@/models/ChatGroup';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(req, { params }) {
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
        const { memberId } = await req.json();

        if (!memberId) {
            return NextResponse.json({ success: false, error: 'Member ID is required' }, { status: 400 });
        }

        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        // Verify that the requester is the admin
        if (group.admin.toString() !== decoded.id) {
            return NextResponse.json({ success: false, error: 'Only group admins can remove members' }, { status: 403 });
        }

        // Prevent admin from removing themselves
        if (memberId === group.admin.toString()) {
            return NextResponse.json({ success: false, error: 'Group admin cannot be removed' }, { status: 400 });
        }

        // Remove the member
        group.members = group.members.filter(m => m.toString() !== memberId);
        await group.save();

        const updatedGroup = await ChatGroup.findById(groupId).populate('members', 'name role avatar');

        return NextResponse.json({ success: true, group: updatedGroup });
    } catch (err) {
        console.error('Remove member error:', err);
        return NextResponse.json({ success: false, error: 'Failed to remove member' }, { status: 500 });
    }
}
