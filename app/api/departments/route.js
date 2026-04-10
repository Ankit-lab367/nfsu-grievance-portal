import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Department from '@/models/Department';
import { verifyToken, extractToken } from '@/lib/auth';
export async function GET(request) {
    try {
        await dbConnect();
        const departments = await Department.find({ isActive: true })
            .populate('adminUsers', 'name email')
            .sort({ name: 1 });
        return NextResponse.json(
            {
                success: true,
                departments,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get departments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch departments' },
            { status: 500 }
        );
    }
}
export async function POST(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'super-admin') {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }
        const body = await request.json();
        const { name, description, email, phone, adminUsers } = body;
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Department name and email are required' },
                { status: 400 }
            );
        }
        const existingDept = await Department.findOne({ name });
        if (existingDept) {
            return NextResponse.json(
                { error: 'Department already exists' },
                { status: 400 }
            );
        }
        const department = await Department.create({
            name,
            description,
            email,
            phone,
            adminUsers: adminUsers || [],
        });
        return NextResponse.json(
            {
                success: true,
                message: 'Department created successfully',
                department,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create department error:', error);
        return NextResponse.json(
            { error: 'Failed to create department' },
            { status: 500 }
        );
    }
}