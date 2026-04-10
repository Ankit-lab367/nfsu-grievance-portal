import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AcademicResource from '@/models/AcademicResource';
import { unlink } from 'fs/promises';
import path from 'path';
export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });
        }
        const resource = await AcademicResource.findById(id);
        if (!resource) {
            return NextResponse.json({ success: false, message: 'Resource not found' }, { status: 404 });
        }
        if (resource.fileUrl) {
            try {
                const filePath = path.join(process.cwd(), 'public', resource.fileUrl);
                await unlink(filePath);
            } catch (err) {
                console.error('File deletion error (might not exist):', err);
            }
        }
        await AcademicResource.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Resource deleted' });
    } catch (error) {
        console.error('Delete resource error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}