// backend/src/controllers/productController.js
import db from '../config/db.js';
import { logAction } from '../utils/logger.js';
import { broadcastNotification } from './notificationController.js';

// Define the categories to match your MySQL ENUM
const VALID_CATEGORIES = [
    'Fragrance', 
    'Makeup', 
    'Face Care', 
    'Home Nutrition', 
    'Bath and Body', 
    "Men's Store"
];

/**
 * Get all products
 */
export const getAllProducts = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * Add a new product
 */
export const addProduct = async (req, res) => {
    const { name, description = null, price, stock, category } = req.body;
    
    if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    const query = 'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)';
    
    try {
        const [result] = await db.query(query, [name, description, parsedPrice, parsedStock, category, image_url]);

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

        // ─── 📡 LIVE STREAM BROADCAST TRIGGER ────────────────────────────────
        try {
            await broadcastNotification(
                "New Catalog Addition! 🎁",
                `A fresh product "${name}" was added to ${category}!`,
                "product",
                req.io
            );
        } catch (broadcastErr) {
            console.error("Notification stream broadcast failure on addProduct:", broadcastErr);
        }
        // ────────────────────────────────────────────────────────────────────

        // ─── 📢 WEBSOCKET REAL-TIME BROADCAST (OrderClick V2 Sync) ──────────
        try {
            if (req.io) {
                const newProduct = {
                    id: result.insertId,
                    name,
                    description,
                    price: parsedPrice,
                    category
                };

                req.io.emit('new_product_notification', {
                    message: `New catalog update: ${name} has been added to the store!`,
                    product: newProduct,
                    timestamp: new Date()
                });
            }
        } catch (socketErr) {
            console.error("Non-blocking socket event dispatch failure on addProduct:", socketErr);
        }
        // ────────────────────────────────────────────────────────────────────

        return res.status(201).json({ success: true, message: 'Product added successfully!', id: result.insertId });

    } catch (err) {
        console.error("DB Error:", err.message); 
        return res.status(500).json({ error: err.message });
    }
};

/**
 * Update an existing product
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
        const [result] = await db.query(sqlQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Target product row not found." });
        }

        // ─── 🚀 AUDIT TRACKING TRIGGER: PRODUCT MODIFICATION ─────────────────
        try {
            await logAction({
                userId: req.user?.id,
                fullname: req.user?.fullname || req.user?.email || "Unknown Admin",
                role: req.user?.role || 'admin',
                action: 'UPDATE_PRODUCT', 
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

    } catch (error) {
        console.error("Backend controller operation failure:", error);
        return res.status(500).json({ error: "Internal server error execution context." });
    }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);

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

        return res.json({ message: 'Product deleted!' });
        
    } catch (err) {
        console.error("DB Delete Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * Get all admin receipts
 */
/**
 * Get all admin receipts
 */
export const getAllAdminReceipts = async (req, res) => {
    const query = `
        SELECT 
            r.*, 
            p.category 
        FROM receipts r
        INNER JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
    `;

    try {
        const [results] = await db.query(query);
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
/**
 * Get top 5 selling products based on transaction volume matches
 */
/**
 * Get top 5 selling products based on transaction volume matches
 */
export const getTopProducts = async (req, res) => {
    try {
        // ✅ FIXED: Mapping p.id directly to r.product_id based on your phpMyAdmin schema
        const [rows] = await db.query(`
            SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.image_url, 
                COALESCE(SUM(r.quantity), 0) AS sales_count
            FROM products p
            LEFT JOIN receipts r ON p.id = r.product_id
            GROUP BY p.id
            ORDER BY sales_count DESC
            LIMIT 5
        `);
        
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Database tracking error:", error.message);
        return res.status(200).json([]);
    }
};