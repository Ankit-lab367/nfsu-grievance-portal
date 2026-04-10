import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/dbConnect';
import Complaint from '@/models/Complaint';
import Department from '@/models/Department';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/mailer';
export async function PATCH(request) {
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
        if (!['admin', 'super-admin', 'staff'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }
        let complaintId, status, remarks, assignedTo, resolutionDetails;
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            complaintId = formData.get('complaintId');
            status = formData.get('status');
            remarks = formData.get('remarks');
            assignedTo = formData.get('assignedTo');
            const resolutionDescription = formData.get('resolutionDescription');
            if (resolutionDescription) {
                resolutionDetails = {
                    description: resolutionDescription,
                    proof: []
                };
                const proofFiles = formData.getAll('proof');
                if (proofFiles && proofFiles.length > 0) {
                    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'resolutions');
                    try {
                        await mkdir(uploadsDir, { recursive: true });
                    } catch (err) {
                    }
                    for (const file of proofFiles) {
                        if (file && file.size > 0) {
                            const bytes = await file.arrayBuffer();
                            const buffer = Buffer.from(bytes);
                            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
                            const filename = `${uniqueSuffix}-${file.name}`;
                            const filepath = join(uploadsDir, filename);
                            await writeFile(filepath, buffer);
                            resolutionDetails.proof.push({
                                filename: file.name,
                                url: `/uploads/resolutions/${filename}`,
                            });
                        }
                    }
                }
            }
        } else {
            const body = await request.json();
            complaintId = body.complaintId;
            status = body.status;
            remarks = body.remarks;
            assignedTo = body.assignedTo;
            resolutionDetails = body.resolutionDetails;
        }
        if (!complaintId) {
            return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
        }
        const complaint = await Complaint.findById(complaintId).populate('userId');
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }
        if (status) {
            const oldStatus = complaint.status;
            complaint.addTimelineEntry(status, remarks, decoded.id);
            if (oldStatus !== status) {
                await Department.findOneAndUpdate(
                    { name: complaint.department },
                    {
                        $inc: {
                            [`complaintCount.${oldStatus.toLowerCase().replace(' ', '')}`]: -1,
                            [`complaintCount.${status.toLowerCase().replace(' ', '')}`]: 1,
                        }
                    }
                );
            }
            await Notification.create({
                userId: complaint.userId._id,
                type: 'status_update',
                title: 'Complaint Status Updated',
                message: `Your complaint ${complaint.complaintId} status has been updated to ${status}`,
                complaintId: complaint._id,
                link: `/complaint/${complaint.complaintId}`,
            });
            if (complaint.userId && complaint.userId.email) {
                await sendEmail(
                    complaint.userId.email,
                    'Complaint Status Updated',
                    emailTemplates.statusUpdate(complaint.complaintId, status, remarks)
                );
            }
        }
        if (assignedTo) {
            complaint.assignedTo = assignedTo;
            await Notification.create({
                userId: assignedTo,
                type: 'assignment',
                title: 'New Complaint Assigned',
                message: `Complaint ${complaint.complaintId} has been assigned to you`,
                complaintId: complaint._id,
                link: `/complaint/${complaint.complaintId}`,
                priority: 'high',
            });
        }
        if (resolutionDetails) {
            complaint.resolutionDetails = {
                description: resolutionDetails.description,
                resolvedBy: decoded.id,
                resolvedAt: new Date(),
                proof: resolutionDetails.proof || [],
            };
            complaint.status = 'Resolved';
            if (complaint.userId && complaint.userId.email) {
                await sendEmail(
                    complaint.userId.email,
                    'Complaint Resolved',
                    emailTemplates.complaintResolved(
                        complaint.complaintId,
                        resolutionDetails.description
                    )
                );
            }
            const allUsers = await User.find({}, '_id');
            const globalNotifications = allUsers.map(u => ({
                userId: u._id,
                type: 'resolution',
                title: 'Grievance Resolved',
                message: `${complaint.title} - Resolved`,
                complaintId: complaint._id,
                link: '/complaint/history',
                priority: 'medium'
            }));
            if (globalNotifications.length > 0) {
                await Notification.insertMany(globalNotifications);
            }
        }
        await complaint.save();
        return NextResponse.json(
            {
                success: true,
                message: 'Complaint updated successfully',
                complaint,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Complaint update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update complaint' },
            { status: 500 }
        );
    }
}