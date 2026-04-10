import { NextResponse } from 'next/server';

const ipCache = new Map();

export function middleware(request) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/api/')) {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const now = Date.now();
        const limit = 100;
        const windowMs = 60 * 1000;

        const userRequests = ipCache.get(ip) || [];
        const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

        if (recentRequests.length >= limit) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        recentRequests.push(now);
        ipCache.set(ip, recentRequests);

        if (ipCache.size > 1000) {
            const firstKey = ipCache.keys().next().value;
            ipCache.delete(firstKey);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};