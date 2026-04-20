import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';
import { put } from '@vercel/blob';

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

        let formData;
        try {
            formData = await request.formData();
        } catch (err) {
            console.error('Error parsing form data:', err);
            return NextResponse.json({ error: 'Failed to parse form data. Ensure the request is multipart/form-data with a valid boundary.' }, { status: 400 });
        }

        const file = formData.get('avatar');
        let avatarUrl;

        if (file && typeof file !== 'string' && file.size > 0) {
            // Validate file size (5MB limit)
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
            }

            const originalName = file.name || 'avatar.png';
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '');
            const filename = `avatar-${uniqueSuffix}-${sanitizedName}`;

            // Check if BLOB_READ_WRITE_TOKEN is available (Vercel Production)
            if (process.env.BLOB_READ_WRITE_TOKEN) {
                try {
                    const bytes = await file.arrayBuffer();
                    const { url } = await put(filename, bytes, {
                        access: 'public',
                        contentType: file.type || 'image/png'
                    });
                    avatarUrl = url;
                } catch (blobError) {
                    console.error('Vercel Blob upload failed:', blobError);
                    // Fallback will happen below if needed, but we log the error
                }
            }
            
            // Fallback to local storage (Development only)
            if (!avatarUrl) {
                const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
                try {
                    await mkdir(uploadsDir, { recursive: true });
                } catch (err) {
                    console.error('Directory creation error:', err);
                }

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const filepath = join(uploadsDir, filename);
                
                await writeFile(filepath, buffer);
                avatarUrl = `/uploads/avatars/${filename}`;
            }
        }

        const updateData = {};
        if (avatarUrl) {
            updateData.avatar = avatarUrl;
        }

        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ 
                success: true, 
                message: 'No changes detected',
                user: await User.findById(decoded.id).select('-password')
            });
        }

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error while updating profile' },
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