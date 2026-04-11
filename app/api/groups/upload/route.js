import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

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

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Data = buffer.toString('base64');
        const url = `data:${file.type};base64,${base64Data}`;
        const type = file.type.startsWith('image/') ? 'image' : 'file';

        return NextResponse.json({
            success: true,
            attachment: {
                url,
                type,
                name: file.name
            }
        });
    } catch (err) {
        console.error('File upload error:', err);
        return NextResponse.json({ success: false, error: 'FileUpload failed' }, { status: 500 });
    }
}
