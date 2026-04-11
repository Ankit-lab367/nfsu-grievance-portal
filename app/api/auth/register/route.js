import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import OTP from '@/models/OTP';
import { sanitizeInput } from '@/lib/security';
import bcrypt from 'bcryptjs';
import { sendEmail, emailTemplates } from '@/lib/mailer';
import path from 'path';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { put } from '@vercel/blob';

export async function POST(request) {
    try {
        await dbConnect();
        
        let name, email, password, enrollmentNumber, course, year, phone, role, otp, avatar;
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            name = formData.get('name');
            email = formData.get('email');
            password = formData.get('password');
            enrollmentNumber = formData.get('enrollmentNumber');
            course = formData.get('course');
            year = formData.get('year');
            phone = formData.get('phone');
            role = formData.get('role');
            otp = formData.get('otp');
            avatar = formData.get('avatar'); // This will be a File object
        } else {
            const body = await request.json();
            ({ name, email, password, enrollmentNumber, course, year, phone, role, otp } = body);
        }

        // Check if OTP is provided
        if (!otp) {
            return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
        }

        const emailLower = email.toLowerCase();

        // Check if OTP exists for this email
        const otpRecord = await OTP.findOne({ email: emailLower });
        if (!otpRecord) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // Compare provided OTP with hashed OTP in database
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }
        
        // Delete OTP after successful verification
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

        if (userRole === 'student' && !emailLower.endsWith('@gmail.com')) {
            return NextResponse.json(
                { error: 'Students must use a valid Gmail address (@gmail.com) to register.' },
                { status: 400 }
            );
        }
        
        if ((userRole === 'teacher' || userRole === 'staff') && !emailLower.endsWith('@gmail.com')) {
            return NextResponse.json(
                { error: 'Teachers and Staff must use a valid Gmail address (@gmail.com) to register.' },
                { status: 400 }
            );
        }
        if (userRole === 'student' && !enrollmentNumber) {
            return NextResponse.json(
                { error: 'Enrollment number is required for students' },
                { status: 400 }
            );
        }

        // Additional validation for staff
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

        // Handle Avatar Upload if provided (Vercel Blob Storage)
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
            enrollmentNumber,
            course,
            year: year ? parseInt(year) : undefined,
            phone,
            role: userRole,
            avatar: avatarPath,
            isActive: userRole === 'staff' ? false : true,
        });

        // If staff, send approval email to admin
        if (userRole === 'staff') {
            const approvalToken = jwt.sign(
                { userId: user._id, type: 'staff-approval' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim();
            const approvalLink = `${baseUrl}/api/admin/approve-staff?token=${approvalToken}`;
            // avatarPath is already a full Vercel Blob URL, no need to prepend baseUrl
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