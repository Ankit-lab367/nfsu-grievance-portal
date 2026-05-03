import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BannedEmail from '@/models/BannedEmail';
import { verifyToken, extractToken } from '@/lib/auth';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/mailer';

export async function GET(request) {
    try {
        await dbConnect();
        
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

        const adminUser = await User.findById(decoded.id);
        if (!adminUser || adminUser.role !== 'super-admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const bannedEmails = await BannedEmail.find().sort({ bannedAt: -1 });
        return NextResponse.json({ success: true, bannedEmails });
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

        const adminUser = await User.findById(decoded.id);
        if (!adminUser || adminUser.role !== 'super-admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // 1. Find the banned email record to get the email address
        const bannedRecord = await BannedEmail.findById(id);
        if (!bannedRecord) {
            return NextResponse.json({ error: 'Banned record not found' }, { status: 404 });
        }

        const targetEmail = bannedRecord.email;

        // 2. Delete the record
        await BannedEmail.findByIdAndDelete(id);

        // 3. Send unban notification
        try {
            await sendEmail(
                targetEmail,
                '🔓 Access Restored - NFSU Grievance Portal',
                emailTemplates.unbanNotification()
            );
        } catch (emailErr) {
            console.error('Failed to send unban email:', emailErr);
            // We still return success because the DB record was deleted
        }

        return NextResponse.json({ success: true, message: 'Email unbanned successfully and user notified' });
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
