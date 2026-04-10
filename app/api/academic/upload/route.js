import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AcademicResource from '@/models/AcademicResource';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';
export async function POST(req) {
    try {
        await dbConnect();
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        const formData = await req.formData();
        const file = formData.get('file');
        const title = formData.get('title');
        const degree = formData.get('degree');
        const semester = formData.get('semester');
        const type = formData.get('type');
        const term = formData.get('term');
        if (!file || !title || !degree || !semester || !type) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '_' + file.name.replaceAll(' ', '_');
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        await writeFile(path.join(uploadDir, filename), buffer);
        const fileUrl = `/uploads/${filename}`;
        const newResource = await AcademicResource.create({
            title,
            degree,
            semester,
            type,
            term,
            fileUrl,
            fileType: file.type,
            uploadedBy: user._id,
        });
        return NextResponse.json({ success: true, resource: newResource }, { status: 201 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}