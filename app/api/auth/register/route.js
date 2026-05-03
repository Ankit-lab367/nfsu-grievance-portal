import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import BannedEmail from '@/models/BannedEmail';
import { generateToken } from '@/lib/auth';
import OTP from '@/models/OTP';
import { sanitizeInput } from '@/lib/security';
import bcrypt from 'bcryptjs';
import { sendEmail, emailTemplates } from '@/lib/mailer';
import path from 'path';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { put } from '@vercel/blob';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'teacher', 'staff', 'admin']).optional(),
    enrollmentNumber: z.coerce.string().optional(),
    course: z.string().optional(),
    year: z.coerce.string().regex(/^\d+$/, 'Year must be a number').optional(),
    phone: z.coerce.string().optional(),
    otp: z.coerce.string().min(4, 'Verification code is too short')
});

export async function POST(request) {
    try {
        await dbConnect();
        
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

        
        const limiter = await rateLimit(ip, 'register', 5);
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
        }
        
        let name, email, password, enrollmentNumber, course, year, phone, role, otp, avatar;
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            
            const getField = (name) => {
                const val = formData.get(name);
                return val !== null ? val : undefined;
            };

            name = getField('name');
            email = getField('email');
            password = getField('password');
            enrollmentNumber = getField('enrollmentNumber');
            course = getField('course');
            year = getField('year');
            phone = getField('phone');
            role = getField('role');
            otp = getField('otp');
            avatar = formData.get('avatar'); 
        } else {
            const body = await request.json();
            ({ name, email, password, enrollmentNumber, course, year, phone, role, otp } = body);
        }

        const result = registerSchema.safeParse({
            name, email, password, enrollmentNumber, course, year, phone, role, otp
        });

        if (!result.success) {
            
            const errorMessage = result.error.errors?.[0]?.message || 
                               result.error.issues?.[0]?.message || 
                               'Validation failed';
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        
        if (!otp) {
            return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
        }

        const emailLower = email.toLowerCase();

        
        const isBanned = await BannedEmail.findOne({ email: emailLower });
        if (isBanned) {
            return NextResponse.json({ error: 'This email has been banned from the portal.' }, { status: 403 });
        }

        
        const otpRecord = await OTP.findOne({ email: emailLower });
        if (!otpRecord) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }
        
        
        await OTP.deleteMany({ email: emailLower });

        name = sanitizeInput(name);
        enrollmentNumber = sanitizeInput(enrollmentNumber);
        course = sanitizeInput(course);

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }
        const userRole = role || 'student';


        

        if (userRole === 'student' && !enrollmentNumber) {
            return NextResponse.json(
                { error: 'Enrollment number is required for students' },
                { status: 400 }
            );
        }

        
        if (userRole === 'staff' && !avatar) {
            return NextResponse.json({ error: 'Profile picture is mandatory for staff members' }, { status: 400 });
        }

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

        
        let avatarPath = '';
        let imageBuffer = null;
        if (avatar && avatar instanceof Blob) {
            imageBuffer = Buffer.from(await avatar.arrayBuffer());
            const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}${path.extname(avatar.name) || '.jpg'}`;
            const { url } = await put(fileName, imageBuffer, {
                access: 'public',
                contentType: avatar.type || 'image/jpeg'
            });
            avatarPath = url;
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            
            
            ...(enrollmentNumber ? { enrollmentNumber } : {}),
            course,
            year: year ? parseInt(year) : undefined,
            phone,
            role: userRole,
            avatar: avatarPath,
            isActive: userRole === 'staff' ? false : true,
        });

        
        if (userRole === 'staff') {
            const approvalToken = jwt.sign(
                { userId: user._id, type: 'staff-approval' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim();
            const approvalLink = `${baseUrl}/api/admin/approve-staff?token=${approvalToken}`;
            
            const fullAvatarUrl = avatarPath || '';

            await sendEmail(
                'nfsugrievanceportal@gmail.com',
                'Staff Verification Required - NFSU Grievance Portal',
                emailTemplates.staffApprovalRequest({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                }, approvalLink),
                imageBuffer ? [{
                    filename: 'staff-photo.jpg',
                    content: imageBuffer,
                    cid: 'staffAvatar'
                }] : []
            );

            const token = generateToken(user);

            return NextResponse.json({
                success: true,
                message: 'Registration successful. Your account is pending administrator verification.',
                pendingVerification: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            }, { status: 201 });
        }

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
                    isVerifiedID: user.isVerifiedID,
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