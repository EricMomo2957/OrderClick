import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import manageCustomerRoutes from './routes/ManageCustomerRoutes.js'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
// [CORS is essential to allow your frontend at port 5173 to talk to this backend]
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

/** * ADMIN ROUTES 
 * This prefix ensures that:
 * 1. router.get('/customers') in your route file becomes http://localhost:5000/api/admin/customers
 * 2. router.get('/stats') in your route file becomes http://localhost:5000/api/admin/stats
 */
app.use('/api/admin', manageCustomerRoutes); 

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: "OrderClick API is running with MySQL!" });
});

// Error Handling Middleware (Optional but helpful for debugging JSON syntax errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});