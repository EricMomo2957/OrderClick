import db from '../config/db.js'; // Adjust path to your db pool configuration

/**
 * Utility helper to record any user or admin activity to the audit matrix.
 */
export const logAction = async ({ userId, fullname, role, action, resource, resourceId = null, details = null, req = null }) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
        const userAgent = req ? req.headers['user-agent'] : null;

        const query = `
            INSERT INTO audit_logs (user_id, fullname, role, action, resource, resource_id, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.promise().execute(query, [
            userId || null,
            fullname || 'System',
            role || 'system',
            action,
            resource,
            resourceId,
            details ? (typeof details === 'object' ? JSON.stringify(details) : details) : null,
            ipAddress,
            userAgent
        ]);
    } catch (error) {
        // Log to console so server monitoring detects an audit database failure, but don't crash the application cycle
        console.error("FATAL: Failed to write system audit log entry:", error);
    }
};