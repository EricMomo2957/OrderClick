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

// Add these to your ManageCustomerController.js to support the new UI cards!

// --- 3. FETCH REVENUE SUMMARY (DAILY, WEEKLY, MONTHLY) ---
export const getRevenueSummary = async (req, res) => {
    try {
        const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
            db.promise().execute("SELECT COALESCE(SUM(total_price), 0) as daily FROM receipts WHERE status = 'verified' AND DATE(created_at) = CURDATE()"),
            db.promise().execute("SELECT COALESCE(SUM(total_price), 0) as weekly FROM receipts WHERE status = 'verified' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"),
            db.promise().execute("SELECT COALESCE(SUM(total_price), 0) as monthly FROM receipts WHERE status = 'verified' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())")
        ]);

        res.json({
            daily: dailyRes[0][0].daily,
            weekly: weeklyRes[0][0].weekly,
            monthly: monthlyRes[0][0].monthly
        });
    } catch (error) {
        console.error("Error fetching revenue summary:", error);
        res.status(500).json({ message: "Database error" });
    }
};



// --- 5. FETCH TOP SELLING PRODUCTS ---
export const getTopProducts = async (req, res) => {
    try {
        // Fetches products sorted by highest volume count
        const query = "SELECT id, name as product_name, price, stock as sales_count FROM products ORDER BY stock DESC LIMIT 5"; 
        // 💡 Note: Customize the query above if you have an orders_items table tracking quantity sold!
        const [rows] = await db.promise().execute(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({ message: "Database error" });
    }
};

// --- 4. FETCH RECENT ORDERS (Option B) ---
export const getRecentOrders = async (req, res) => {
    try {
        // Joins receipts table with users table using your relational key mapping
        const query = `
            SELECT 
                r.id, 
                u.fullname as customer_name, 
                r.total_price as total_amount, 
                r.status 
            FROM receipts r
            INNER JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC 
            LIMIT 5
        `;
        const [rows] = await db.promise().execute(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        res.status(500).json({ message: "Database error" });
    }
};