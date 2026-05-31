// BACKEND/src/utils/logger.js
import db from '../config/db.js';

/**
 * Robust tracking utility to record user, admin, or system activity to the audit registry.
 * It automatically extracts operator parameters from the request context if provided, 
 * fallback structures, or direct parameters overriding execution contexts.
 */
export const logActivity = async ({ 
    req = null, 
    action, 
    resource, 
    resourceId = null, 
    details = null,
    userId = null, 
    fullname = null, 
    role = null,
    ipAddress = null,
    userAgent = null
}) => {
    try {
        // 1. Fallback Hierarchy: Extract actor identifiers from request or direct overrides
        const actorId = userId || req?.user?.id || null;
        const actorName = fullname || req?.user?.fullname || req?.user?.email || "System Engine";
        const actorRole = role || req?.user?.role || 'system';

        // 2. Network Parameters Extraction
        let resolvedIpAddress = ipAddress || '::1';
        if (req) {
            resolvedIpAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '::1';
            // Normalize standard localhost IPv6 looping string variant if detected
            if (resolvedIpAddress === '::ffff:127.0.0.1') resolvedIpAddress = '::1';
        }
        
        const resolvedUserAgent = userAgent || (req ? (req.headers['user-agent'] || 'Unknown Agent') : 'System Process');

        // 3. Normalize Detail Parameters (Extract string from object if needed)
        let logDetails = "No execution details provided.";
        if (details) {
            if (typeof details === 'object') {
                // If it passes an object containing a message property, use it; otherwise stringify the object
                logDetails = details.message || JSON.stringify(details);
            } else {
                logDetails = details;
            }
        }

        // 4. Exact Query Matching Your phpMyAdmin Database Columns
        const query = `
            INSERT INTO audit_logs (
                user_id, 
                fullname, 
                role, 
                action, 
                resource, 
                resource_id, 
                details, 
                ip_address, 
                user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // 5. Driver Validation: Checks if pool demands .promise() explicitly
        const queryExecutionBuffer = db.promise ? db.promise() : db;

        // Execute query parameters safely to avoid sql injections
        await queryExecutionBuffer.execute(query, [
            actorId,
            actorName,
            actorRole,
            action,
            resource,
            resourceId,
            logDetails,
            resolvedIpAddress,
            resolvedUserAgent
        ]);

    } catch (error) {
        // Keeps pipeline error non-blocking so an audit issue doesn't break app flow
        console.error("CRITICAL: Failed to save system audit tracking entry:", error);
    }
};

// Aliased fallback export to support both logAction and logActivity namespaces in controllers
export const logAction = logActivity;