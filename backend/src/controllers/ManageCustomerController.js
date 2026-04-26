import db from '../config/db.js'; // Ensure your DB import is also ES Module style

// Use 'export' directly before the function
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