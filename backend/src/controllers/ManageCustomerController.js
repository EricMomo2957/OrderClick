// backend/src/controllers/ManageCustomerController.js
import db from '../config/db.js';

// --- 1. FETCH ALL REGISTERED CUSTOMERS ---
/**
 * Retrieves a list of users with the 'customer' role.
 * Uses native async/await syntax matching promise pool configurations.
 */
export const getAllCustomers = async (req, res) => {
    const query = "SELECT id, fullname, email, created_at FROM users WHERE role = 'customer'";
    
    try {
        const [rows] = await db.execute(query);
        return res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching customers:", err);
        return res.status(500).json({ message: "Database error" });
    }
};

// --- 2. FETCH DASHBOARD OVERVIEW STATISTICS ---
/**
 * Gathers summary data for the Admin Dashboard.
 * Fixes the 'ER_PARSE_ERROR' by running queries individually in parallel.
 * Now calculates true low stock count (items with stock between 1 and 5).
 */
export const getStats = async (req, res) => {
    try {
        // Promise.all runs these queries simultaneously, which is faster and
        // bypasses the security restriction against multiple statements in one string.
        const [revenueRes, receiptsRes, productsRes, lowStockRes] = await Promise.all([
            db.execute("SELECT SUM(total_price) as revenue FROM receipts WHERE status = 'verified'"),
            db.execute("SELECT COUNT(*) as receipts FROM receipts"),
            db.execute("SELECT COUNT(*) as products FROM products"),
            db.execute("SELECT COUNT(*) as lowStock FROM products WHERE stock > 0 AND stock <= 5")
        ]);

        // Mapping the results. 
        // mysql2 returns an array where [0] is the rows and [1] is the fields.
        const stats = {
            revenue: revenueRes[0][0].revenue || 0,
            receipts: receiptsRes[0][0].receipts || 0,
            products: productsRes[0][0].products || 0,
            lowStock: lowStockRes[0][0].lowStock || 0 
        };

        return res.json(stats);
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

// --- 3. FETCH REVENUE SUMMARY (DAILY, WEEKLY, MONTHLY) ---
export const getRevenueSummary = async (req, res) => {
    try {
        const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
            db.execute("SELECT COALESCE(SUM(total_price), 0) as daily FROM receipts WHERE status = 'verified' AND DATE(created_at) = CURDATE()"),
            db.execute("SELECT COALESCE(SUM(total_price), 0) as weekly FROM receipts WHERE status = 'verified' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"),
            db.execute("SELECT COALESCE(SUM(total_price), 0) as monthly FROM receipts WHERE status = 'verified' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())")
        ]);

        return res.json({
            daily: dailyRes[0][0].daily,
            weekly: weeklyRes[0][0].weekly,
            monthly: monthlyRes[0][0].monthly
        });
    } catch (error) {
        console.error("Error fetching revenue summary:", error);
        return res.status(500).json({ message: "Database error" });
    }
};

// --- 4. FETCH TOP SELLING PRODUCTS ---
export const getTopProducts = async (req, res) => {
    try {
        // Fetches products sorted by highest volume count
        const query = "SELECT id, name as product_name, price, stock as sales_count FROM products ORDER BY stock DESC LIMIT 5"; 
        const [rows] = await db.execute(query);
        return res.json(rows);
    } catch (error) {
        console.error("Error fetching top products:", error);
        return res.status(500).json({ message: "Database error" });
    }
};

// --- 5. FETCH RECENT ORDERS ---
export const getRecentOrders = async (req, res) => {
    try {
        // Uses LEFT JOIN and COALESCE fallback for guest_name so guest transactions show correctly on analytics cards
        const query = `
            SELECT 
                r.id, 
                COALESCE(u.fullname, r.guest_name, 'Anonymous Guest') as customer_name, 
                r.total_price as total_amount, 
                r.status 
            FROM receipts r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC 
            LIMIT 5
        `;
        const [rows] = await db.execute(query);
        return res.json(rows);
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        return res.status(500).json({ message: "Database error" });
    }
};