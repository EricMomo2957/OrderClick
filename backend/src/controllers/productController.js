// BACKEND/src/controllers/productController.js
import db from '../config/db.js';
import { logAction } from '../utils/logger.js';

// Define the categories to match your MySQL ENUM
const VALID_CATEGORIES = [
    'Fragrance', 
    'Makeup', 
    'Face Care', 
    'Home Nutrition', 
    'Bath and Body', 
    'Men\'s Store'
];

/**
 * Get all products
 */
export const getAllProducts = (req, res) => {
    db.query('SELECT * FROM products ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/**
 * Add a new product
 */
export const addProduct = (req, res) => {
    const { name, description = null, price, stock, category } = req.body;
    
    if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    const query = 'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, description, parsedPrice, parsedStock, category, image_url], async (err, result) => {
        if (err) {
            console.error("DB Error:", err.message); 
            return res.status(500).json({ error: err.message });
        }

        // ─── 🚀 AUDIT TRACKING TRIGGER: PRODUCT CREATION ─────────────────────
        try {
            await logAction({
                userId: req.user?.id,
                fullname: req.user?.fullname || req.user?.email || 'Unknown Admin', 
                role: req.user?.role || 'admin',
                action: 'CREATE_PRODUCT', 
                resource: 'products',
                resourceId: result.insertId,
                details: JSON.stringify({
                    message: `Admin successfully added a new inventory item: "${name}" under the "${category}" category.`,
                    initial_fields: { name, category, price: parsedPrice, stock: parsedStock }
                }),
                req: req
            });
        } catch (logErr) {
            console.error("Non-blocking audit log capture failure on addProduct:", logErr);
        }
        // ────────────────────────────────────────────────────────────────────

        res.status(201).json({ message: 'Product added!', id: result.insertId });
    });
};

/**
 * Update an existing product (Using clean async/await & telemetry extraction)
 */
export const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, description = null, price, stock, category } = req.body;
    
    if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    let sqlQuery = 'UPDATE products SET name=?, description=?, price=?, stock=?, category=?';
    let params = [name, description, parsedPrice, parsedStock, category];

    if (req.file) {
        sqlQuery += ', image_url=?';
        params.push(`/uploads/${req.file.filename}`);
    }

    sqlQuery += ' WHERE id=?';
    params.push(productId);

    try {
        // Convert to promise-compatible query call if your driver supports it, or use standard callback execution wrapper
        db.query(sqlQuery, params, async (err, result) => {
            if (err) {
                console.error("DB Update Error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Target product row not found." });
            }

            // ─── 🚀 AUDIT TRACKING TRIGGER: PRODUCT MODIFICATION ─────────────────
            try {
                await logAction({
                    userId: req.user?.id,
                    fullname: req.user?.fullname || req.user?.email || "Unknown Admin",
                    role: req.user?.role || 'admin',
                    action: 'UPDATE_PRODUCT', // Matches your frontend badge mapping rules beautifully!
                    resource: 'products',
                    resourceId: productId,
                    details: JSON.stringify({
                        updated_fields: { name, price: parsedPrice, stock: parsedStock, category },
                        timestamp: new Date().toISOString()
                    }),
                    req: req
                });
            } catch (logErr) {
                console.error("Non-blocking audit log capture failure on updateProduct:", logErr);
            }
            // ────────────────────────────────────────────────────────────────────

            return res.status(200).json({ message: 'Product updated!' });
        });

    } catch (error) {
        console.error("Backend controller operation failure:", error);
        return res.status(500).json({ error: "Internal server error execution context." });
    }
};

/**
 * Delete a product
 */
export const deleteProduct = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], async (err, result) => {
        if (err) {
            console.error("DB Delete Error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // ─── 🚀 AUDIT TRACKING TRIGGER: PRODUCT PURGE ────────────────────────
        try {
            await logAction({
                userId: req.user?.id,
                fullname: req.user?.fullname || req.user?.email || 'Unknown Admin',
                role: req.user?.role || 'admin',
                action: 'DELETE_PRODUCT',
                resource: 'products',
                resourceId: id,
                details: JSON.stringify({ message: `Permanent deletion execution cleared product data row matching index ID #${id}.` }),
                req: req
            });
        } catch (logErr) {
            console.error("Non-blocking audit log capture failure on deleteProduct:", logErr);
        }
        // ────────────────────────────────────────────────────────────────────

        res.json({ message: 'Product deleted!' });
    });
};

/**
 * Get all admin receipts
 */
export const getAllAdminReceipts = (req, res) => {
    const query = `
        SELECT 
            r.*, 
            p.category 
        FROM receipts r
        INNER JOIN products p ON r.product_name = p.name
        ORDER BY r.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};