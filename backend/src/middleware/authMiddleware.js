import jwt from 'jsonwebtoken';

/**
 * verifyToken Middleware
 * 1. Checks for the Authorization header.
 * 2. Extracts the Bearer token.
 * 3. Verifies the JWT and attaches the decoded user (id, role, etc.) to req.user.
 */
export const verifyToken = (req, res, next) => {
    // Look for the header (standard practice uses lowercase 'authorization')
    const authHeader = req.headers['authorization'];
    
    // Extract the token from "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is provided, block the request
    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    // Verify the token using the secret key from your .env file
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        
        /**
         * CRITICAL: Attach the decoded payload to req.user.
         * This allows controllers to access req.user.id or req.user.userId.
         */
        req.user = decoded; 
        
        // Move to the next middleware or controller
        next();
    });
};

// Optional: Keep a default export if you prefer, but named export is better for clarity
export default verifyToken;