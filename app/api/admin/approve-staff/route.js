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
            return new Response('<h1 style="font-family:Arial;text-align:center;padding:50px;color:#dc2626">Error: Missing Token</h1>', { headers: { 'Content-Type': 'text/html' } });
        }

        let decoded;
        try {
            // Trim the JWT_SECRET in case of environment variable whitespace issues
            const secret = (process.env.JWT_SECRET || '').trim();
            decoded = jwt.verify(token, secret);
        } catch (jwtError) {
            const isExpired = jwtError.name === 'TokenExpiredError';
            return new Response(`
                <div style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: #dc2626;">❌ ${isExpired ? 'Link Expired' : 'Invalid Link'}</h1>
                    <p>${isExpired 
                        ? 'This verification link has expired (valid for 7 days). Please ask the staff member to register again.' 
                        : 'This verification link is invalid or has already been used.'
                    }</p>
                    <br>
                    <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()}" 
                       style="padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px;">
                       Back to Portal
                    </a>
                </div>
            `, { headers: { 'Content-Type': 'text/html' } });
        }

        if (decoded.type !== 'staff-approval') {
            return new Response('<h1 style="font-family:Arial;text-align:center;padding:50px;color:#dc2626">Error: Invalid token type</h1>', { headers: { 'Content-Type': 'text/html' } });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return new Response('<h1 style="font-family:Arial;text-align:center;padding:50px;color:#dc2626">Error: User not found. They may have deleted their account.</h1>', { headers: { 'Content-Type': 'text/html' } });
        }

        if (user.isActive) {
            return new Response(`
                <div style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: #2563eb;">ℹ️ Already Verified</h1>
                    <p>Staff member <strong>${user.name}</strong> is already active.</p>
                    <br>
                    <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()}" 
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
                <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()}" 
                   style="padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px;">
                   Back to Portal
                </a>
            </div>
        `, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        console.error('Approval error:', error);
        return new Response(`<h1 style="font-family:Arial;text-align:center;padding:50px;color:#dc2626">Error: ${error.message}</h1>`, { headers: { 'Content-Type': 'text/html' } });
    }
}
