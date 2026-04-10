import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatGroup from '@/models/ChatGroup';
import User from '@/models/User';
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
        const { memberIds } = await req.json();

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return NextResponse.json({ success: false, error: 'No members specified' }, { status: 400 });
        }

        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        // Verify that the requester is the admin
        if (group.admin.toString() !== decoded.id) {
            return NextResponse.json({ success: false, error: 'Only group admins can add members' }, { status: 403 });
        }

        // Filter out already existing members
        const currentMembers = group.members.map(m => m.toString());
        const newMembers = memberIds.filter(id => !currentMembers.includes(id));

        if (newMembers.length === 0) {
            return NextResponse.json({ success: false, error: 'All specified users are already members' }, { status: 400 });
        }

        // Verify users exist
        const users = await User.find({ _id: { $in: newMembers } });
        if (users.length !== newMembers.length) {
            return NextResponse.json({ success: false, error: 'Some users do not exist' }, { status: 404 });
        }

        group.members.push(...newMembers);
        await group.save();

        const updatedGroup = await ChatGroup.findById(groupId).populate('members', 'name role avatar');

        return NextResponse.json({ success: true, group: updatedGroup });
    } catch (err) {
        console.error('Add member error:', err);
        return NextResponse.json({ success: false, error: 'Failed to add members' }, { status: 500 });
    }
}
