import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user with password field
        const dbStart = Date.now();
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        const dbTime = Date.now() - dbStart;

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Your account has been blocked. Access revoked by God Mode.' },
                { status: 403 }
            );
        }

        // Compare password
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

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
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
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
