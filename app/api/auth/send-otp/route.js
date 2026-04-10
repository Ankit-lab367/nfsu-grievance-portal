import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OTP from '@/models/OTP';
import { sendEmail } from '@/lib/mailer';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, role } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const emailLower = email.toLowerCase();

        // Re-apply domain restrictions to prevent spam
        if (!emailLower.endsWith('@gmail.com')) {
            return NextResponse.json({ error: 'Only Gmail addresses (@gmail.com) are allowed to register.' }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP for database storage
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Delete any existing OTP for this email
        await OTP.deleteMany({ email: emailLower });

        // Save new hashed OTP
        await OTP.create({
            email: emailLower,
            otp: hashedOtp
        });

        // Send email
        const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #1d4ed8;">NFSU Grievance Portal - Verification Code</h2>
                <p>Hello,</p>
                <p>You are registering for the NFSU Grievance Redressal Portal. Your verification code is:</p>
                <div style="font-size: 32px; font-bold: true; letter-spacing: 5px; color: #dc2626; margin: 20px 0;">${otp}</div>
                <p>This code will expire in 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr style="border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">© 2024 National Forensic Sciences University</p>
            </div>
        `;

        const mailResult = await sendEmail(
            emailLower,
            'Verification Code - NFSU Grievance Portal',
            emailContent
        );

        if (!mailResult.success) {
            // Keep the OTP in console for local dev/testing if mail fails
            console.log(`[DEBUG] OTP for ${emailLower}: ${otp}`);
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to send email. If you are a developer, please check the server logs for the code.',
                debug_otp: otp // Only for local testing, remove in production
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Send-OTP error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
