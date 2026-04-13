import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SSOCode from '@/models/SSOCode';
import crypto from 'crypto';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json({ error: 'Email and name are required for SSO generation' }, { status: 400 });
        }

        // 1. Task: Generate a secure, random 32-character string (16 bytes = 32 hex chars)
        const generatedCode = crypto.randomBytes(16).toString('hex');

        // 2. Task: Save this code into MongoDB (sso_codes collection)
        // Includes email, name, and timestamp (createdAt handled by Schema TTL)
        await SSOCode.create({
            code: generatedCode,
            email: email.toLowerCase(),
            name,
            createdAt: new Date()
        });

        console.log(`🎟️  SSO Ticket Generated for ${email}: [${generatedCode.substring(0, 8)}...]`);

        // 3. Task: Return the code to the frontend
        return NextResponse.json({
            success: true,
            code: generatedCode
        }, { status: 200 });

    } catch (error) {
        console.error('SSO Code Generation Error:', error.message);
        return NextResponse.json({ 
            error: 'Internal Server Error during SSO ticket generation',
            details: error.message 
        }, { status: 500 });
    }
}
