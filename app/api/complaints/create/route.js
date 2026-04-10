import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/dbConnect';
import Complaint from '@/models/Complaint';
import Department from '@/models/Department';
import Notification from '@/models/Notification';
import { verifyToken, extractToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/mailer';
import User from '@/models/User';
import { sanitizeInput } from '@/lib/security';
export async function POST(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const formData = await request.formData();
        const department = formData.get('department');
        const category = formData.get('category');
        let title = sanitizeInput(formData.get('title'));
        let description = sanitizeInput(formData.get('description'));
        const priority = formData.get('priority');
        const isAnonymous = formData.get('isAnonymous') === 'true';
        const files = formData.getAll('files');
        const attachments = [];
        if (files && files.length > 0) {
            const uploadsDir = join(process.cwd(), 'public', 'uploads', 'complaints');
            try {
                await mkdir(uploadsDir, { recursive: true });
            } catch (err) {
                console.log('Directory exists or creation failed:', err);
            }
            for (const file of files) {
                if (file && file.size > 0) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
                    const filename = `${uniqueSuffix}-${file.name}`;
                    const filepath = join(uploadsDir, filename);
                    await writeFile(filepath, buffer);
                    attachments.push({
                        filename: file.name,
                        url: `/uploads/complaints/${filename}`,
                    });
                }
            }
        }
        const complaint = await Complaint.create({
            userId: decoded.id,
            department,
            category,
            title,
            description,
            priority: priority || 'Medium',
            isAnonymous,
            attachments,
        });
        await Department.findOneAndUpdate(
            { name: department },
            {
                $inc: {
                    'complaintCount.total': 1,
                    'complaintCount.pending': 1,
                }
            }
        );
        await Notification.create({
            userId: decoded.id,
            type: 'complaint',
            title: 'Complaint Registered',
            message: `Your complaint ${complaint.complaintId} has been registered successfully.`,
            complaintId: complaint._id,
            link: `/complaint/${complaint.complaintId}`,
        });
        const user = await User.findById(decoded.id);
        if (user && user.email) {
            await sendEmail(
                user.email,
                'Complaint Registered Successfully',
                emailTemplates.complaintRegistered(
                    complaint.complaintId,
                    department,
                    description
                )
            );
        }
        return NextResponse.json(
            {
                success: true,
                message: 'Complaint registered successfully',
                complaint: {
                    id: complaint._id,
                    complaintId: complaint.complaintId,
                    department: complaint.department,
                    status: complaint.status,
                    createdAt: complaint.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Complaint creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create complaint' },
            { status: 500 }
        );
    }
}