import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('auth_token')?.value;
    
    let response;
    let authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    
    const isDummyHeader = !authHeader || 
                          authHeader === 'Bearer null' || 
                          authHeader === 'Bearer undefined' || 
                          authHeader === 'Bearer cookie-auth';
    
    if (token && isDummyHeader) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('Authorization', `Bearer ${token}`);
        response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } else {
        response = NextResponse.next();
    }

    // --- Security Headers ---

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME-type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // XSS protection (legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Restrict browser features
    response.headers.set(
        'Permissions-Policy',
        'camera=(self), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    return response;
}

// Apply to all routes except static assets and Next.js internals
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};