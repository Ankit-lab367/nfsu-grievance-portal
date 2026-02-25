import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { name, email, password, enrollmentNumber, course, year, phone, role } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // For students, enrollment number is required
        const userRole = role || 'student';
        if (userRole === 'student' && !enrollmentNumber) {
            return NextResponse.json(
                { error: 'Enrollment number is required for students' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                enrollmentNumber ? { enrollmentNumber } : null
            ].filter(Boolean)
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or enrollment number already exists' },
                { status: 400 }
            );
        }

        // Create new user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            enrollmentNumber,
            course,
            year,
            phone,
            role: role || 'student',
        });

        // Generate token
        const token = generateToken(user);

        return NextResponse.json(
            {
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    enrollmentNumber: user.enrollmentNumber,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
