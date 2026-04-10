import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatGroup from '@/models/ChatGroup';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(req) {
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

        const { name, memberIds } = await req.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ success: false, error: 'Group name is required' }, { status: 400 });
        }
        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return NextResponse.json({ success: false, error: 'At least one member must be selected' }, { status: 400 });
        }

        // Verify members exist
        const users = await User.find({ _id: { $in: memberIds } });
        if (users.length !== memberIds.length) {
             return NextResponse.json({ success: false, error: 'Some selected members do not exist' }, { status: 404 });
        }

        // Include the creator in the members list if not already
        const finalMembers = new Set([...memberIds, decoded.id]);

        const group = await ChatGroup.create({
            name: name.trim(),
            members: Array.from(finalMembers),
            admin: decoded.id,
        });

        return NextResponse.json({ success: true, group });
    } catch (err) {
        console.error('Create group error:', err);
        return NextResponse.json({ success: false, error: 'Failed to create group' }, { status: 500 });
    }
}
