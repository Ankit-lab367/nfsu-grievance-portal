import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';
export async function GET(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}
export async function PUT(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const formData = await request.formData();
        const file = formData.get('avatar');
        let avatarUrl;
        if (file && file.size > 0) {
            const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
            try {
                await mkdir(uploadsDir, { recursive: true });
            } catch (err) {
                console.log('Directory exists or creation failed:', err);
            }
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`; 
            const filepath = join(uploadsDir, filename);
            await writeFile(filepath, buffer);
            avatarUrl = `/uploads/avatars/${filename}`;
        }
        const updateData = {};
        if (avatarUrl) {
            updateData.avatar = avatarUrl;
        }
        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updateData },
            { new: true }
        ).select('-password');
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        
        const body = await request.json();
        const { phone } = body;
        
        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }
        
        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: { phone } },
            { new: true }
        ).select('-password');
        
        return NextResponse.json({
            success: true,
            message: 'Phone number updated successfully',
            user
        });
    } catch (error) {
        console.error('Profile phone update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update phone number' },
            { status: 500 }
        );
    }
}