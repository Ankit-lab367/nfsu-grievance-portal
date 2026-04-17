import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SSOCode from '@/models/SSOCode';
import User from '@/models/User';

// --- Reverse mapping helpers (Grievance DB → ForenSync Firestore keys) ---

const reverseCourseMap = {
    'B.Sc-M.Sc Forensic Science': 'bsc-msc-forensic',
    'B.Tech-M.Tech Cyber Security': 'btech-mtech-cybersecurity',
    'M.Sc Forensic Science': 'msc-forensic',
    'M.Sc Cyber Security': 'msc-cyber',
    'MBA Cyber Security': 'mba-cyber',
};

/**
 * Convert course name back to ForenSync's programId slug.
 * Falls back to a basic slugification if the course isn't in the map.
 */
function toProgramId(course) {
    if (!course) return null;
    if (reverseCourseMap[course]) return reverseCourseMap[course];
    // Fallback: lowercase + hyphenate
    return course.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Convert stored academic year + current calendar month → ForenSync semesterId.
 * Odd semesters run Aug–Jan, even semesters run Feb–Jul.
 *   year 1 → sem-1 (Aug-Jan) or sem-2 (Feb-Jul)
 *   year 2 → sem-3 (Aug-Jan) or sem-4 (Feb-Jul)
 *   etc.
 */
function toSemesterId(year) {
    if (!year || year < 1) return 'sem-1';
    const month = new Date().getMonth(); // 0-indexed: 0=Jan … 11=Dec
    const isOddSemester = month >= 7 || month === 0; // Aug(7)–Dec(11) + Jan(0)
    const semNum = (year - 1) * 2 + (isOddSemester ? 1 : 2);
    return `sem-${semNum}`;
}

/**
 * Capitalize the first letter of a role string.
 * 'student' → 'Student', 'super-admin' → 'Super-admin'
 */
function capitalizeRole(role) {
    if (!role) return 'Student';
    return role.charAt(0).toUpperCase() + role.slice(1);
}

// ---------------------------------------------------------------------------

export async function POST(request) {
    try {
        // 1. Validate shared secret
        const incomingSecret = request.headers.get('x-sso-secret');
        const expectedSecret = process.env.SSO_SHARED_SECRET;

        if (!expectedSecret) {
            console.error('🔴 SSO_SHARED_SECRET is not set in environment variables');
            return NextResponse.json(
                { error: 'Internal Server Error: SSO configuration missing' },
                { status: 500 }
            );
        }

        if (!incomingSecret || incomingSecret !== expectedSecret) {
            console.warn('🚫 Invalid or missing x-sso-secret in verify-code request');
            return NextResponse.json(
                { error: 'Unauthorized: Invalid SSO secret' },
                { status: 401 }
            );
        }

        // 2. Parse incoming code
        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Bad Request: code is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // 3. Atomically burn the code (findOneAndDelete prevents replay attacks)
        const ssoEntry = await SSOCode.findOneAndDelete({ code });

        if (!ssoEntry) {
            console.warn(`🚫 SSO code not found or already used: [${code.substring(0, 8)}...]`);
            return NextResponse.json(
                { error: 'Invalid or expired SSO code' },
                { status: 404 }
            );
        }

        console.log(`🔥 SSO code burned for: ${ssoEntry.email}`);

        // 4. Look up the full user profile from our DB
        const user = await User.findOne({ email: ssoEntry.email.toLowerCase() });

        if (!user) {
            // Code was valid but user no longer exists — still return base info
            console.warn(`⚠️  User not found in DB for SSO email: ${ssoEntry.email}`);
            return NextResponse.json({
                email: ssoEntry.email.toLowerCase(),
                name: ssoEntry.name,
                role: 'Student',
                rollNumber: null,
                programId: null,
                semesterId: 'sem-1',
            }, { status: 200 });
        }

        // 5. Build enriched ForenSync payload using their database keys
        //    user.year getter auto-adjusts for academic progression
        const userObj = user.toObject({ getters: true });

        const payload = {
            email: userObj.email,
            name: userObj.name,
            role: capitalizeRole(userObj.role),
            rollNumber: userObj.enrollmentNumber || null,
            programId: toProgramId(userObj.course),
            semesterId: toSemesterId(userObj.year),
        };

        console.log(`✅ SSO verify-code success → returning payload for ${payload.email} (${payload.role})`);

        return NextResponse.json(payload, { status: 200 });

    } catch (error) {
        console.error('SSO verify-code unexpected error:', error.message);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
