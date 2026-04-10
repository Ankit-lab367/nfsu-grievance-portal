import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return new Response('<h1>Error: Missing Token</h1>', { headers: { 'Content-Type': 'text/html' } });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'staff-approval') {
            throw new Error('Invalid token type');
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return new Response('<h1>Error: User not found</h1>', { headers: { 'Content-Type': 'text/html' } });
        }

        if (user.isActive) {
            return new Response(`
                <div style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: #2563eb;">Notice</h1>
                    <p>Staff member <strong>${user.name}</strong> is already verified.</p>
                    <br>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                       style="padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px;">
                       Back to Portal
                    </a>
                </div>
            `, { headers: { 'Content-Type': 'text/html' } });
        }

        user.isActive = true;
        await user.save();

        return new Response(`
            <div style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: #059669;">✅ Verification Successful!</h1>
                <p>Staff member <strong>${user.name}</strong> has been successfully verified.</p>
                <p>They can now log in to the portal using their credentials.</p>
                <br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                   style="padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px;">
                   Back to Portal
                </a>
            </div>
        `, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        console.error('Approval error:', error);
        return new Response('<h1>Error: Invalid or expired verification link</h1>', { headers: { 'Content-Type': 'text/html' } });
    }
}
