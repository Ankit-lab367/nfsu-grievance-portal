import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const { secret } = await request.json();

        if (!secret) {
            return NextResponse.json({ error: 'Secret required' }, { status: 400 });
        }

        const godModeHash = process.env.GOD_MODE_HASH;
        
        if (!godModeHash) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const isValid = await bcrypt.compare(secret, godModeHash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
        }

        // Generate a standard JWT but force the super-admin role
        const payload = {
            id: 'god-mode-synthetic-id',
            email: 'admin@nfsu.edu.in',
            role: 'super-admin',
            name: 'System Administrator',
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        return NextResponse.json({
            success: true,
            token,
            user: payload
        });

    } catch (error) {
        console.error('God mode error:', error);
        return NextResponse.json(
            { error: 'Failed to authenticate' },
            { status: 500 }
        );
    }
}
