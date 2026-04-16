import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import axios from 'axios';
import crypto from 'crypto';

export async function POST(request) {
    try {
        await dbConnect();
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'SSO code is required' }, { status: 400 });
        }

        // 1. Task: Server-to-server verification with ForenSync
        const ssoSecret = process.env.SSO_SHARED_SECRET;
        
        if (!ssoSecret) {
            console.error('SSO_SHARED_SECRET is not configured in environment variables');
            return NextResponse.json({ error: 'Internal Server Error: SSO configuration missing' }, { status: 500 });
        }

        let response;
        try {
            response = await axios.post('https://forensync-backend.onrender.com/api/sso/verify-code', 
                { code }, 
                { 
                    headers: { 
                        'x-sso-secret': ssoSecret,
                        'Content-Type': 'application/json'
                    } 
                }
            );
        } catch (axiosError) {
            console.error('ForenSync Verification Error Response:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message
            });
            
            return NextResponse.json({ 
                error: 'SSO Verification Failed',
                details: axiosError.response?.data?.error || axiosError.message 
            }, { status: axiosError.response?.status || 500 });
        }

        // Check for email in response instead of success
        if (!response.data || !response.data.email) {
            console.error('ForenSync returned invalid data format:', response.data);
            return NextResponse.json({ error: 'Invalid or expired SSO code' }, { status: 401 });
        }

        const { email, name } = response.data;

        // 2. Task: Find or Create User
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Create a new user account via SSO if they don't exist
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await User.create({
                email: email.toLowerCase(),
                name,
                password: randomPassword,
                role: 'student', // Default role
                isVerifiedID: true, // Verified via partner
                isActive: true
            });
            console.log(`✨ New user created via ForenSync SSO: ${email}`);
        } else {
            // Update last login status for existing user
            user.lastLogin = new Date();
            await user.save();
        }

        // 3. Task: Generate standard JWT token
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerifiedID: user.isVerifiedID
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Unexpected SSO error:', error.message);
        return NextResponse.json({ 
            error: 'SSO Verification Failed',
            details: error.message 
        }, { status: 500 });
    }
}
