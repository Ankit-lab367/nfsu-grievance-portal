import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        
        // Apply rate limit: 10 attempts per minute per IP
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
        if (user.role === 'student' && !email.toLowerCase().endsWith('@gmail.com')) {
            return NextResponse.json(
                { error: 'Student access is restricted to official emails (@gmail.com) only.' },
                { status: 403 }
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
        user.lastLogin = new Date();
        await user.save();
        const token = generateToken(user);
        return NextResponse.json(
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
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack,
            body: body
        });
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}