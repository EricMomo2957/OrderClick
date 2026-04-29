import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // 1. Look for the 'Authorization' header
    const authHeader = req.headers.authorization;
    
    // 2. Extract the token (format: "Bearer <token>")
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. Please log in first." });
    }

    try {
        // 3. Verify the token using your JWT_SECRET from .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the user data to the request so the controller can use it
        req.user = verified;
        
        // 5. Proceed to the next function (the updateProfile controller)
        next();
    } catch (err) {
        // If the token is fake or expired
        res.status(403).json({ error: "Invalid session. Please log in again." });
    }
};

export default authMiddleware;