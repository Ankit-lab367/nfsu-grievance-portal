import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ChatGroup from '@/models/ChatGroup';
import { verifyToken, extractToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

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

        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        // Verify that the requester is the admin
        if (group.admin.toString() !== decoded.id) {
            return NextResponse.json({ success: false, error: 'Only the group creator can change the profile picture' }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `group_${groupId}_${Date.now()}${path.extname(file.name)}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/chat');

        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        await writeFile(path.join(uploadDir, filename), buffer);

        const url = `/uploads/chat/${filename}`;

        // Update the group record
        group.avatar = url;
        await group.save();

        const updatedGroup = await ChatGroup.findById(groupId).populate('members', 'name role avatar');

        return NextResponse.json({ success: true, group: updatedGroup });
    } catch (err) {
        console.error('Group avatar upload error:', err);
        return NextResponse.json({ success: false, error: 'Failed to upload group picture' }, { status: 500 });
    }
}
