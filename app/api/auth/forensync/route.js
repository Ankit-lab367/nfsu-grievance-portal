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

        const { email, name, role: payloadRole, rollNumber, programId, semesterId } = response.data;

        const mappedRole = payloadRole ? payloadRole.toLowerCase() : 'student';
        const year = semesterId ? Math.ceil(parseInt(semesterId.replace('sem-', '')) / 2) : 1;
        
        const courseMap = {
            'bsc-msc-forensic': 'B.Sc-M.Sc Forensic Science',
            'btech-mtech-cse': 'B.Tech-M.Tech Cyber Security',
            'msc-forensic': 'M.Sc Forensic Science',
            'msc-cyber': 'M.Sc Cyber Security',
            'mba-cyber': 'MBA Cyber Security',
        };
        const formatProgramId = (id) => {
            if (!id) return '';
            if (courseMap[id]) return courseMap[id];
            return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };
        const mappedCourse = formatProgramId(programId);

        // 2. Task: Find or Create User
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Create a new user account via SSO if they don't exist
            const randomPassword = crypto.randomBytes(16).toString('hex');
            
            user = await User.create({
                email: email.toLowerCase(),
                name,
                password: randomPassword,
                role: mappedRole,
                enrollmentNumber: rollNumber,
                course: mappedCourse,
                year,
                isVerifiedID: true, // Verified via partner
                isActive: true
            });
            console.log(`✨ New user created via ForenSync SSO: ${email}`);
        } else {
            // Auto-enrich existing users if their data is missing or out of sync
            user.lastLogin = new Date();
            if (name) user.name = name;
            if (rollNumber) user.enrollmentNumber = rollNumber;
            if (mappedCourse) user.course = mappedCourse;
            if (year && !user.year) user.year = year;
            if (mappedRole && user.role === 'student' && mappedRole !== 'student') {
                 // only upgrade roles, don't downgrade admins
                 user.role = mappedRole;
            } else if (mappedRole && !user.role) {
                 user.role = mappedRole;
            }
            
            user.isVerifiedID = true; 
            await user.save();
            console.log(`♻️ Existing user enriched via ForenSync SSO: ${email}`);
        }

        const isProfileComplete = !!user.phone;

        // 3. Task: Generate standard JWT token
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            token,
            isProfileComplete,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerifiedID: user.isVerifiedID,
                phone: user.phone
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
