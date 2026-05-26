import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';

const verifyOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    otpCode: z.string().length(6, 'Verification code must be 6 digits')
});

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

        const limiter = await rateLimit(ip, 'verify-otp', 5);
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 });
        }

        const result = verifyOtpSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
        }

        let { email, otpCode } = result.data;
        email = sanitizeInput(email);
        otpCode = sanitizeInput(otpCode);

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Your account is currently inactive. Please contact the administrator.' },
                { status: 403 }
            );
        }

        const hashedInputOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
        if (!user.otpCode || user.otpCode !== hashedInputOtp) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        if (user.otpExpires && new Date() > user.otpExpires) {
            return NextResponse.json(
                { error: 'Verification code has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Clear OTP code to prevent reuse
        user.otpCode = undefined;
        user.otpExpires = undefined;
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        const response = NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    enrollmentNumber: user.enrollmentNumber,
                    departmentId: user.departmentId,
                    avatar: user.avatar,
                    isVerifiedID: user.isVerifiedID,
                },
            },
            { status: 200 }
        );

        setAuthCookie(response, token);
        return response;
    } catch (error) {
        console.error('OTP verification error details:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error: `Verification failed: ${error.message}` },
            { status: 500 }
        );
    }
}
