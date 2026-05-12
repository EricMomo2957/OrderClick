import db from '../config/db.js';

// --- 1. FETCH ALL REGISTERED CUSTOMERS ---
/**
 * Retrieves a list of users with the 'customer' role.
 * Uses .promise().execute() for compatibility with the modern async pattern.
 */
export const getAllCustomers = async (req, res) => {
    const query = "SELECT id, fullname, email, created_at FROM users WHERE role = 'customer'";
    
    try {
        // We use the promise wrapper to allow the use of 'await'
        const [rows] = await db.promise().execute(query);
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).json({ message: "Database error" });
    }
};

// --- 2. FETCH DASHBOARD OVERVIEW STATISTICS ---
/**
 * Gathers summary data for the Admin Dashboard.
 * Fixes the 'ER_PARSE_ERROR' by running queries individually in parallel.
 */
export const getStats = async (req, res) => {
    try {
        // Promise.all runs these queries simultaneously, which is faster and
        // bypasses the security restriction against multiple statements in one string.
        const [revenueRes, receiptsRes, productsRes] = await Promise.all([
            db.promise().execute("SELECT SUM(total_price) as revenue FROM receipts WHERE status = 'verified'"),
            db.promise().execute("SELECT COUNT(*) as receipts FROM receipts"),
            db.promise().execute("SELECT COUNT(*) as products FROM products")
        ]);

        // Mapping the results. 
        // Note: mysql2 returns an array where [0] is the rows and [1] is the fields.
        // Thus, revenueRes[0][0] accesses the first row of the first result set.
        const stats = {
            revenue: revenueRes[0][0].revenue || 0,
            receipts: receiptsRes[0][0].receipts || 0,
            products: productsRes[0][0].products || 0,
            lowStock: 0 // Placeholder for future inventory logic
        };

        res.json(stats);
    } catch (error) {
        // Detailed logging to your terminal to help debug any further SQL issues
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};