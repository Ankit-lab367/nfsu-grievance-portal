import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatGroup from '@/models/ChatGroup';
import GroupMessage from '@/models/GroupMessage';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(req, { params }) {
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

        // Verify group exists and user is part of it
        const group = await ChatGroup.findById(groupId).populate('members', 'name role avatar');
        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }
        if (!group.members.some(member => member._id.toString() === decoded.id)) {
            return NextResponse.json({ success: false, error: 'You are not a member of this group' }, { status: 403 });
        }

        // Fetch messages and populate sender info
        const messages = await GroupMessage.find({ groupId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name role avatar')
            .lean();

        return NextResponse.json({ success: true, messages, group });
    } catch (err) {
        console.error('Fetch group messages error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
    }
}

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
        const { content, attachments } = await req.json();

        if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
            return NextResponse.json({ success: false, error: 'Message content or attachment is required' }, { status: 400 });
        }

        // Verify group exists and user is part of it
        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }
        if (!group.members.includes(decoded.id)) {
            return NextResponse.json({ success: false, error: 'You are not a member of this group' }, { status: 403 });
        }

        const message = await GroupMessage.create({
            groupId,
            sender: decoded.id,
            content: content?.trim() || '',
            attachments: attachments || [],
        });

        // Populate sender info to return back so UI can display it
        const populatedMessage = await message.populate('sender', 'name role avatar');

        return NextResponse.json({ success: true, message: populatedMessage });
    } catch (err) {
        console.error('Send group message error:', err);
        return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }
}
