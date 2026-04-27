import db from '../config/db.js';

// Fetch all registered customers
export const getAllCustomers = (req, res) => {
    const query = "SELECT id, fullname, email, created_at FROM users WHERE role = 'customer'";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching customers:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json(results);
    });
};

// Fetch Dashboard Overview Statistics
export const getAdminStats = (req, res) => {
    // We combine three queries into one string
    const query = `
        SELECT SUM(total_price) as revenue FROM receipts WHERE status = 'verified';
        SELECT COUNT(*) as receipts FROM receipts;
        SELECT COUNT(*) as products FROM products;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching stats:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // results will be an array of arrays when running multiple queries
        res.json({
            revenue: results[0][0].revenue || 0,
            receipts: results[1][0].receipts || 0,
            products: results[2][0].products || 0,
            lowStock: 0 // You can add a specific count for low stock here later
        });
    });
};