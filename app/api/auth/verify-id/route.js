import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/mailer';
import { validateNFSUIDCard } from '@/lib/idCardValidator';

export async function POST(request) {
    try {
        await dbConnect();
        
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
        
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const { idImage } = await request.json();
        if (!idImage) {
            return NextResponse.json({ error: 'No ID image provided' }, { status: 400 });
        }

        // Strict NFSU ID Card Verification
        const validation = await validateNFSUIDCard(idImage);
        if (!validation.isValid) {
            return NextResponse.json({
                error: validation.reason || 'Image is not recognized as a valid NFSU Student ID Card. Please ensure the blue header and NFSU logo are clearly visible.'
            }, { status: 400 });
        }
        
        user.idCardPhoto = idImage;
        await user.save();
        
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim();
        const verifyLink = `${baseUrl}/api/admin/verify-student?userId=${user._id}`;
        const banLink = `${baseUrl}/api/admin/ban-student?userId=${user._id}`;

        
        const base64Data = idImage.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        await sendEmail(
            'nfsugrievanceportal@gmail.com',
            `ID Verification Required: ${user.name} (${user.enrollmentNumber})`,
            emailTemplates.studentIdVerification({
                name: user.name,
                email: user.email,
                enrollmentNumber: user.enrollmentNumber || 'N/A',
                phone: user.phone || 'N/A',
                course: user.course || 'N/A',
                year: user.year || 'N/A'
            }, verifyLink, banLink),
            [{
                filename: 'student-id-capture.jpg',
                content: imageBuffer,
                cid: 'studentIdPhoto'
            }]
        );

        return NextResponse.json({
            success: true,
            message: 'Verification request submitted to administrator',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerifiedID: user.isVerifiedID
            }
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
