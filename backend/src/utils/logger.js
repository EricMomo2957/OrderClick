// BACKEND/src/utils/logger.js
import db from '../config/db.js';

/**
 * Robust tracking utility to record user, admin, or system activity to the audit registry.
 * It automatically extracts operator parameters from the request if provided.
 */
export const logAction = async ({ 
    req = null, 
    action, 
    resource, 
    resourceId = null, 
    details = null,
    userId = null, 
    fullname = null, 
    role = null 
}) => {
    try {
        // 1. Fallback Hierarchy: Extract actor identifiers from verified request context or direct overrides
        const actorId = userId || req?.user?.id || null;
        const actorName = fullname || req?.user?.fullname || req?.user?.email || "System Engine";
        const actorRole = role || req?.user?.role || 'system';

        // 2. Network Parameters Extraction
        let ipAddress = '::1';
        if (req) {
            ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '::1';
            // Normalize standard localhost IPv6 looping string variant if detected
            if (ipAddress === '::ffff:127.0.0.1') ipAddress = '::1';
        }
        
        const userAgent = req ? (req.headers['user-agent'] || 'Unknown Agent') : 'System Process';

        // 3. Normalize Detail Parameters (Supports strings or complex structured JSON telemetry tracking)
        let logDetails = null;
        if (details) {
            logDetails = typeof details === 'object' ? JSON.stringify(details) : details;
        }

        const query = `
            INSERT INTO audit_logs (user_id, fullname, role, action, resource, resource_id, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // 4. Driver Validation: Checks if pool demands .promise() explicitly or handles it natively
        const queryExecutionBuffer = db.promise ? db.promise() : db;

        await queryExecutionBuffer.execute(query, [
            actorId,
            actorName,
            actorRole,
            action,
            resource,
            resourceId,
            logDetails,
            ipAddress,
            userAgent
        ]);

    } catch (error) {
        // Keeps pipeline error non-blocking so a database issue doesn't crash customer-facing routes
        console.error("CRITICAL: Failed to save system audit tracking entry:", error);
    }
};