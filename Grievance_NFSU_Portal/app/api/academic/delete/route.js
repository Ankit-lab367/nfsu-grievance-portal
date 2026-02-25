import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AcademicResource from '@/models/AcademicResource';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(req) {
    try {
        await dbConnect();

        // We assume God Mode protection is handled by the frontend/middleware or secret code access.
        // For extra security, we could verify a special header or taken, but for now we follow the existing pattern.

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });
        }

        const resource = await AcademicResource.findById(id);
        if (!resource) {
            return NextResponse.json({ success: false, message: 'Resource not found' }, { status: 404 });
        }

        // Delete file from filesystem
        if (resource.fileUrl) {
            try {
                // fileUrl is like "/uploads/filename.ext"
                // process.cwd() is the root
                const filePath = path.join(process.cwd(), 'public', resource.fileUrl);
                await unlink(filePath);
            } catch (err) {
                console.error('File deletion error (might not exist):', err);
                // Continue to delete from DB even if file is missing
            }
        }

        await AcademicResource.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Resource deleted' });

    } catch (error) {
        console.error('Delete resource error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
