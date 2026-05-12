import jwt from 'jsonwebtoken';

/**
 * verifyToken Middleware
 * 1. Checks for the Authorization header.
 * 2. Extracts the Bearer token.
 * 3. Verifies the JWT and attaches the decoded user to req.user.
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Extract the token from "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        
        // Attach decoded payload (id, role, email, etc.) to req.user
        req.user = decoded; 
        next();
    });
};

/**
 * isAdmin Middleware
 * Ensures the logged-in user has an 'admin' role.
 * MUST be used after verifyToken.
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: "Access Restricted. Admin permissions required." });
    }
};

export default verifyToken;