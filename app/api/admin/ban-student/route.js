import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import BannedEmail from '@/models/BannedEmail';
import { sendEmail, emailTemplates } from '@/lib/mailer';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new NextResponse('User ID is required', { status: 400 });
        }

        // Redirect to the frontend page where admin can provide a reason
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim();
        return NextResponse.redirect(`${baseUrl}/admin/ban-student-reason?userId=${userId}`);

    } catch (error) {
        console.error('Banning redirect error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        
        // Auth check
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }
        
        const adminUser = await User.findById(decoded.id);
        if (!adminUser || adminUser.role !== 'super-admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const userId = formData.get('userId');
        const comment = formData.get('comment');
        const imageFiles = formData.getAll('images');

        if (!userId || !comment) {
            return NextResponse.json({ error: 'User ID and comment are required' }, { status: 400 });
        }

        const userToBan = await User.findById(userId);
        if (!userToBan) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const emailToBan = userToBan.email;

        // 1. Create entry in BannedEmail collection
        await BannedEmail.create({
            email: emailToBan,
            reason: comment
        });

        // 2. Prepare attachments for the email
        const attachments = [];
        for (const file of imageFiles) {
            const buffer = Buffer.from(await file.arrayBuffer());
            attachments.push({
                filename: file.name,
                content: buffer
            });
        }

        // 3. Send notification email to the student
        await sendEmail(
            emailToBan,
            '🚨 IMPORTANT: Your account has been banned',
            emailTemplates.studentBanNotification(comment, adminUser.name),
            attachments
        );

        // 4. Delete the student account
        await User.findByIdAndDelete(userId);

        return NextResponse.json({ 
            success: true, 
            message: 'Student banned successfully and notified.' 
        });

    } catch (error) {
        console.error('Ban submission error:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.stack 
        }, { status: 500 });
    }
}
