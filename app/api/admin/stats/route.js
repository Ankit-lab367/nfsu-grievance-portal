import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Complaint from '@/models/Complaint';
import Department from '@/models/Department';
import User from '@/models/User';
import { verifyToken, extractToken } from '@/lib/auth';
export async function GET(request) {
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
        let stats = {};
        if (decoded.role === 'super-admin') {
            const [
                totalComplaints,
                pendingComplaints,
                inProgressComplaints,
                resolvedComplaints,
                escalatedComplaints,
                totalUsers,
                totalDepartments,
            ] = await Promise.all([
                Complaint.countDocuments(),
                Complaint.countDocuments({ status: 'Pending' }),
                Complaint.countDocuments({ status: 'In Progress' }),
                Complaint.countDocuments({ status: 'Resolved' }),
                Complaint.countDocuments({ status: 'Escalated' }),
                User.countDocuments({ role: 'student' }),
                Department.countDocuments({ isActive: true }),
            ]);
            const complaintsByDept = await Complaint.aggregate([
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]);
            const complaintsByPriority = await Complaint.aggregate([
                { $group: { _id: '$priority', count: { $sum: 1 } } },
            ]);
            const resolvedWithTime = await Complaint.find({
                status: 'Resolved',
                'resolutionDetails.resolvedAt': { $exists: true },
            });
            let avgResolutionTime = 0;
            if (resolvedWithTime.length > 0) {
                const totalTime = resolvedWithTime.reduce((acc, complaint) => {
                    const time = complaint.resolutionDetails.resolvedAt - complaint.createdAt;
                    return acc + time;
                }, 0);
                avgResolutionTime = totalTime / resolvedWithTime.length / (1000 * 60 * 60); 
            }
            stats = {
                totalComplaints,
                pendingComplaints,
                inProgressComplaints,
                resolvedComplaints,
                escalatedComplaints,
                totalUsers,
                totalDepartments,
                complaintsByDepartment: complaintsByDept,
                complaintsByPriority,
                avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
                resolutionRate: totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0,
            };
        } else if (decoded.role === 'admin') {
            const user = await User.findById(decoded.id);
            if (!user || !user.departmentId) {
                return NextResponse.json({ error: 'Department not found' }, { status: 404 });
            }
            const dept = await Department.findById(user.departmentId);
            if (!dept) {
                return NextResponse.json({ error: 'Department not found' }, { status: 404 });
            }
            const [
                totalComplaints,
                pendingComplaints,
                inProgressComplaints,
                resolvedComplaints,
                escalatedComplaints,
            ] = await Promise.all([
                Complaint.countDocuments({ department: dept.name }),
                Complaint.countDocuments({ department: dept.name, status: 'Pending' }),
                Complaint.countDocuments({ department: dept.name, status: 'In Progress' }),
                Complaint.countDocuments({ department: dept.name, status: 'Resolved' }),
                Complaint.countDocuments({ department: dept.name, status: 'Escalated' }),
            ]);
            const allComplaints = await Complaint.find({ department: dept.name, status: { $ne: 'Resolved' } });
            const slaBreached = allComplaints.filter(c => c.checkSLABreach()).length;
            stats = {
                departmentName: dept.name,
                totalComplaints,
                pendingComplaints,
                inProgressComplaints,
                resolvedComplaints,
                escalatedComplaints,
                slaBreached,
                resolutionRate: totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0,
            };
        }
        return NextResponse.json(
            {
                success: true,
                stats,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}