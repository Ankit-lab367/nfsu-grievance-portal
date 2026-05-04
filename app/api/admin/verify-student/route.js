import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/mailer';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new NextResponse('User ID is required', { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        user.isVerifiedID = true;
        await user.save();

        // Send notification email to the student
        try {
            await sendEmail(
                user.email,
                '🛡️ Account Verified - NFSU Grievance Portal',
                emailTemplates.studentVerifiedNotification(user.name)
            );
        } catch (emailErr) {
            console.error('Failed to send verification approval email:', emailErr);
            // We continue as the DB was already updated
        }
        return new NextResponse(`
            <html>
                <body style="font-family: sans-serif; display: flex; flex-direction: column; items-center; justify-content: center; height: 100vh; background-color: #f0fdf4; color: #166534; text-align: center;">
                    <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <h1 style="margin-top: 0;">✅ Student Verified</h1>
                        <p>Account for <b>${user.name}</b> has been successfully activated.</p>
                        <p>They can now access all portal features.</p>
                        <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #166534; color: white; border: none; border-radius: 6px; cursor: pointer;">Close Window</button>
                    </div>
                </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        console.error('Verification error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
