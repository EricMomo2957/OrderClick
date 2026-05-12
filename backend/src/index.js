import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan'; 

// --- ROUTE IMPORTS ---
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import manageCustomerRoutes from './routes/ManageCustomerRoutes.js'; 
import eventRoutes from './routes/eventRoutes.js'; 
import announcementRoutes from './routes/announcementRoutes.js'; // Verified Import

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. MIDDLEWARE & CORS ---
app.use(morgan('dev')); 

// Updated CORS configuration based on your latest request
app.use(cors({
  origin: 'http://localhost:5173', // Matches your Vite frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Included PUT for inventory/user updates
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 2. STATIC FOLDERS ---
// Serve uploads folder with cross-origin headers for receipt/product images
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
})); 

// --- 3. ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', manageCustomerRoutes); 
app.use('/api/events', eventRoutes); 
app.use('/api/announcements', announcementRoutes); // Announcement API Endpoint

app.get('/', (req, res) => {
  res.json({ message: "OrderClick API is running with MySQL!" });
});

// --- 4. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Server started successfully!
  📡 URL: http://localhost:${PORT}
  🛠️  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});