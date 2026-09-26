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



        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        
        const hashedOtp = await bcrypt.hash(otp, 10);

        
        await OTP.deleteMany({ email: emailLower });

        
        await OTP.create({
            email: emailLower,
            otp: hashedOtp
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nfsu-student-grievance-portal.vercel.app';
        const logoUrl = `${appUrl}/logo.png`;

        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
                    <img src="${logoUrl}" alt="NFSU Logo" style="height: 64px; width: auto; object-fit: contain; margin-bottom: 12px;" />
                    <h2 style="color: #1e3a8a; margin: 0; font-size: 20px; font-weight: 700;">NFSU Grievance Portal</h2>
                    <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">National Forensic Sciences University</p>
                </div>
                <div style="padding: 24px 0;">
                    <p style="color: #334155; font-size: 15px; margin: 0 0 12px 0;">Hello,</p>
                    <p style="color: #334155; font-size: 15px; margin: 0 0 20px 0;">You are registering for the NFSU Grievance Redressal Portal. Your verification code is:</p>
                    <div style="text-align: center; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: monospace;">${otp}</span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin: 12px 0 0 0;">⏳ This code will expire in <strong>5 minutes</strong>.</p>
                    <p style="color: #64748b; font-size: 13px; margin: 8px 0 0 0;">If you did not request this verification code, please disregard this email.</p>
                </div>
                <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2024 National Forensic Sciences University. All rights reserved.</p>
                </div>
            </div>
        `;

        const textContent = `NFSU Grievance Portal - Verification Code\n\nHello,\nYour verification code is: ${otp}\nThis code will expire in 5 minutes.\n\n© 2024 National Forensic Sciences University`;

        const mailResult = await sendEmail(
            emailLower,
            'Verification Code - NFSU Grievance Portal',
            emailContent,
            [],
            textContent
        );

        if (!mailResult.success) {
            console.error('Email send failed:', mailResult.error);
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to send verification email. Please check your email address or try again later.' 
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Send-OTP error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
