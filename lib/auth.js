import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Please define JWT_SECRET in your .env.local file');
}
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
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(8);
    return bcrypt.hash(password, salt);
};
export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
export const extractToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
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