import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Please define JWT_SECRET in your .env.local file');
}

const COOKIE_NAME = 'auth_token';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// --- httpOnly Cookie Helpers ---

/**
 * Sets the JWT as an httpOnly secure cookie on a NextResponse object.
 * @param {NextResponse} response - The NextResponse to set the cookie on.
 * @param {string} token - The JWT token string.
 */
export const setAuthCookie = (response, token) => {
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
};

/**
 * Clears the auth cookie on a NextResponse object (for logout).
 * @param {NextResponse} response - The NextResponse to clear the cookie on.
 */
export const clearAuthCookie = (response) => {
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
};

// --- Token Extraction (Dual-Read: Cookie first, then Authorization header) ---

/**
 * Extracts JWT token from a Next.js App Router request.
 * Checks httpOnly cookie first, then falls back to Authorization header.
 * @param {Request} request - The incoming Next.js request object.
 * @returns {string|null} The token string, or null if not found.
 */
export const extractTokenFromRequest = (request) => {
    // 1. Check httpOnly cookie first
    const cookieToken = request.cookies?.get?.(COOKIE_NAME)?.value;
    if (cookieToken) return cookieToken;

    // 2. Fall back to Authorization header
    const authHeader = request.headers?.get?.('authorization') || request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
};

/**
 * Legacy extractToken for backward compatibility with Authorization header string.
 * @param {string} authHeader - The Authorization header value.
 * @returns {string|null}
 */
export const extractToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(8);
    return bcrypt.hash(password, salt);
};
export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
export const authenticate = (handler) => async (req, res) => {
    try {
        const token = extractToken(req.headers.authorization);
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = decoded;
        return handler(req, res);
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};
export const authorize = (...allowedRoles) => (handler) => async (req, res) => {
    try {
        const token = extractToken(req.headers.authorization);
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        if (!allowedRoles.includes(decoded.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        req.user = decoded;
        return handler(req, res);
    } catch (error) {
        return res.status(403).json({ error: 'Authorization failed' });
    }
};