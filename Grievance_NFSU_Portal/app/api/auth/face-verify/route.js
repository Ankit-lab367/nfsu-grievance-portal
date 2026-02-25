import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const FACE_SERVER = 'http://127.0.0.1:5001';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, imageBase64 } = body;

        if (!name || !imageBase64) {
            return NextResponse.json(
                { error: 'name and imageBase64 are required' },
                { status: 400 }
            );
        }

        // ── Call the Python face-verify microservice ──────────────────────────
        let faceResult;
        try {
            const res = await fetch(`${FACE_SERVER}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, image_b64: imageBase64 }),
                // 10-second timeout
                signal: AbortSignal.timeout(10000),
            });
            faceResult = await res.json();
        } catch (fetchErr) {
            console.error('Face server unreachable:', fetchErr.message);
            return NextResponse.json(
                { error: 'Face verification service is not running. Please start the Python server.' },
                { status: 503 }
            );
        }

        if (!faceResult.matched) {
            return NextResponse.json({
                success: false,
                matched: false,
                message: faceResult.message || 'Face did not match. Please try again.',
            });
        }

        // ── Face matched — mark user as faceVerified in MongoDB ───────────────
        await dbConnect();
        const user = await User.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
            { faceVerified: true },
            { new: true }
        );

        if (!user) {
            // Still return matched=true so the user can proceed; the flag just won't be persisted
            console.warn(`Face matched for "${name}" but no DB user found with that name.`);
            return NextResponse.json({
                success: true,
                matched: true,
                message: 'Face verified! (Note: user record not updated)',
            });
        }

        return NextResponse.json({
            success: true,
            matched: true,
            message: 'Identity verified successfully!',
            user: {
                id: user._id,
                name: user.name,
                faceVerified: user.faceVerified,
            },
        });
    } catch (error) {
        console.error('Face verify API error:', error);
        return NextResponse.json(
            { error: error.message || 'Face verification failed' },
            { status: 500 }
        );
    }
}
