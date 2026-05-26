import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmail, emailTemplates } from '@/lib/mailer';
import crypto from 'crypto';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        
        
        const limiter = await rateLimit(ip, 'login', 10);
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
        }

        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
        }

        let { email, password } = result.data;
        email = sanitizeInput(email);
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }
        const dbStart = Date.now();
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const dbTime = Date.now() - dbStart;
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Your account is currently inactive. Please contact the administrator.' },
                { status: 403 }
            );
        }
        const hashStart = Date.now();
        const isPasswordValid = await user.comparePassword(password);
        const hashTime = Date.now() - hashStart;
        console.log(`🔍 Login performance - DB: ${dbTime}ms, Password: ${hashTime}ms`);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
        user.otpCode = hashedOtp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await user.save();

        // Send OTP email
        const mailResult = await sendEmail(
            user.email,
            'NFSU Grievance Portal - Login OTP Verification Code',
            emailTemplates.loginOtp(otpCode, user.name)
        );

        if (!mailResult.success) {
            console.error('❌ Failed to send OTP email:', mailResult.error);
        }

        return NextResponse.json(
            {
                success: true,
                otpRequired: true,
                email: user.email,
                message: 'Verification code sent to your email.'
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error: `Login failed: ${error.message}` },
            { status: 500 }
        );
    }
}