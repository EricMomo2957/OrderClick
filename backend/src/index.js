import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan'; 
import multer from 'multer'; // 1. Added Multer

// --- ROUTE IMPORTS ---
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import manageCustomerRoutes from './routes/ManageCustomerRoutes.js'; 
import eventRoutes from './routes/eventRoutes.js'; 
import announcementRoutes from './routes/announcementRoutes.js'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. MULTER CONFIGURATION ---
// Store files in the 'uploads' directory one level up from the server
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/')); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// --- 2. MIDDLEWARE & CORS ---
app.use(morgan('dev')); 

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 3. STATIC FOLDERS ---
// This allows the browser to access images via http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
})); 

// --- 4. ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', manageCustomerRoutes); 
app.use('/api/events', eventRoutes); 

// UPDATED: If you want to handle the post directly in index.js for debugging:
// However, it is better to use upload.single('image') inside announcementRoutes.js
app.use('/api/announcements', announcementRoutes); 

app.get('/', (req, res) => {
  res.json({ message: "OrderClick API is running with MySQL!" });
});

// --- 5. GLOBAL ERROR HANDLING ---
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