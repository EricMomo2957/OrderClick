import db from '../config/db.js';

// Define the categories to match your MySQL ENUM
const VALID_CATEGORIES = [
    'Fragrance', 
    'Makeup', 
    'Face Care', 
    'Home Nutrition', 
    'Bath and Body', 
    'Men\'s Store'
];

// Get all products
export const getAllProducts = (req, res) => {
    db.query('SELECT * FROM products ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Add a new product
export const addProduct = (req, res) => {
    const { name, description = null, price, stock, category } = req.body;
    
    if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    const query = 'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, description, parsedPrice, parsedStock, category, image_url], (err, result) => {
        if (err) {
            console.error("DB Error:", err.message); 
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Product added!', id: result.insertId });
    });
};

// Update an existing product
export const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, description = null, price, stock, category } = req.body;
    
    if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    let query = 'UPDATE products SET name=?, description=?, price=?, stock=?, category=?';
    let params = [name, description, parsedPrice, parsedStock, category];

    if (req.file) {
        query += ', image_url=?';
        params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id=?';
    params.push(id);

    db.query(query, params, (err) => {
        if (err) {
            console.error("DB Update Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product updated!' });
    });
};

// Delete a product
export const deleteProduct = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
        if (err) {
            console.error("DB Delete Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product deleted!' });
    });
};

// src/controllers/productController.js

// src/controllers/productController.js

export const getAllAdminReceipts = (req, res) => {
    // This query links the receipt to the product to get the Category
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