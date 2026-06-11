// backend/src/controllers/ManageAuditLogController.js
import db from '../config/db.js';

/**
 * Fetches all audit logs from the database with optional search capabilities.
 * Supports filtering by role or searching by name, action, and resource.
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { search, roleFilter } = req.query;
        let query = "SELECT * FROM audit_logs";
        let queryParams = [];
        let conditions = [];

        // Apply role filter tab ('all', 'admin', 'customer')
        if (roleFilter && roleFilter !== 'all') {
            conditions.push("role = ?");
            queryParams.push(roleFilter);
        }

        // Apply search keyword against fullname, action, or resource fields
        if (search) {
            conditions.push("(fullname LIKE ? OR action LIKE ? OR resource LIKE ?)");
            const searchWildcard = `%${search}%`;
            queryParams.push(searchWildcard, searchWildcard, searchWildcard);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        // Sort by newest log entries first (Falls back to created_at if timestamp isn't explicitly used)
        query += " ORDER BY created_at DESC LIMIT 500"; 

        // Direct async/await execution pool without .promise()
        const [logs] = await db.execute(query, queryParams);
        return res.json(logs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

/**
 * Administrative action to clear old logs if maintenance is needed.
 */
export const clearAuditLogs = async (req, res) => {
    try {
        // Optional: truncate entirely or delete logs older than 90 days
        await db.execute("DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL 90 DAY");
        return res.json({ message: "Successfully archived/purged logs older than 90 days." });
    } catch (error) {
        console.error("Error clearing logs:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};