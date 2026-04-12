import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AcademicResource from '@/models/AcademicResource';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { del } from '@vercel/blob';

export async function DELETE(req) {
    try {
        await dbConnect();

        // 1. Authenticate user
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
        if (!user || user.role !== 'super-admin') {
            return NextResponse.json({ success: false, message: 'Forbidden. Only super-admins can delete resources.' }, { status: 403 });
        }

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
                // Delete from Vercel Blob if it's a blob URL
                if (resource.fileUrl.includes('public.blob.vercel-storage.com')) {
                    await del(resource.fileUrl);
                }
            } catch (err) {
                console.error('File deletion error:', err);
            }
        }
        
        await AcademicResource.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Delete resource error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}