import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LostAndFound from '@/models/LostAndFound';
import jwt from 'jsonwebtoken';
import { put } from '@vercel/blob';

function getUserFromToken(request) {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

// GET all active lost & found items
export async function GET(request) {
    try {
        await dbConnect();
        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const items = await LostAndFound.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error('Error fetching lost & found items:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST a new lost & found item
export async function POST(request) {
    try {
        await dbConnect();
        const user = getUserFromToken(request);
        if (!user) {
            console.error('POST /api/lost-and-found: Unauthorized access attempt');
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { subject, description, type, location, image } = body;

        console.log(`POST /api/lost-and-found: Creating ${type} item: ${subject}`);

        if (!subject || !description || !type || !location) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        if (!['lost', 'found'].includes(type)) {
            return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });
        }

        let imageUrl = null;
        if (image) {
            try {
                if (image.startsWith('data:image')) {
                    const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
                    if (match) {
                        const ext = match[1];
                        const base64Data = match[2];
                        const buffer = Buffer.from(base64Data, 'base64');
                        const filename = `lost-found-${Date.now()}.${ext}`;
                        
                        // Check if BLOB_READ_WRITE_TOKEN is available
                        if (process.env.BLOB_READ_WRITE_TOKEN) {
                            const { url } = await put(filename, buffer, {
                                access: 'public',
                                contentType: `image/${ext}`
                            });
                            imageUrl = url;
                        } else {
                            console.warn('Vercel Blob token is missing. Falling back to base64 storage.');
                            imageUrl = image; // Fallback to base64 if no token
                        }
                    }
                } else if (image.startsWith('http')) {
                    imageUrl = image;
                }
            } catch (imageError) {
                console.error('Error uploading image to Vercel Blob:', imageError);
                console.warn('Falling back to direct image storage (base64) due to upload error.');
                imageUrl = image; // Safe fallback so the request doesn't crash
            }
        }

        const newItem = await LostAndFound.create({
            subject,
            description,
            type,
            location,
            image: imageUrl,
            uploaderId: user.email || user.id || 'anonymous_user',
            uploaderName: user.name || 'Anonymous'
        });

        console.log(`POST /api/lost-and-found: Successfully stored item ${newItem._id}`);
        return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    } catch (error) {
        console.error('CRITICAL: Error creating lost & found item:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
