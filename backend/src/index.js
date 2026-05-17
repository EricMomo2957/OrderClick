import express from 'express';
import { createServer } from 'http'; // Native Node module
import { Server } from 'socket.io'; // Installed package
import cors from 'cors'; 
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan'; 
import multer from 'multer';

// --- ROUTE IMPORTS ---
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import manageCustomerRoutes from './routes/ManageCustomerRoutes.js'; 
import eventRoutes from './routes/eventRoutes.js'; 
import announcementRoutes from './routes/announcementRoutes.js'; 
import adminRoutes from './routes/adminRoutes.js'; // 👈 Integrated admin utility features

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/')); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// --- 2. MIDDLEWARE & CORS CONFIGURATION ---
app.use(morgan('dev')); 

// Unified CORS Configuration preventing browser connection blockages (ERR_CONNECTION_REFUSED)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 3. STATIC FILE SERVER ---
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
})); 

// --- 4. CREATE UNIFIED HTTP + WEBSOCKET PLATFORM ---
const httpServer = createServer(app);

// Initialize Socket.io attached directly to the wrapped native HTTP platform
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// Bind WebSocket instances globally across application request contexts
app.set('socketio', io);

// Log and manage live socket stream connections
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to real-time sync: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// --- 5. ROUTES SETUP ---
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/announcements', announcementRoutes); 

// Core Analytics and Metric Overview Routers
app.use('/api/admin', adminRoutes); // This handles: /api/admin/stats, /api/admin/revenue-summary, etc.
app.use('/api/admin/customers-directory', manageCustomerRoutes); // Separated cleanly to keep directory routes modular

app.get('/', (req, res) => {
  res.json({ message: "OrderClick API is running with MySQL and Socket.io WebSockets!" });
});

// --- 6. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// --- 7. SERVER INITIALIZATION ---
// Bound to httpServer execution instead of standard basic app express core framework
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
  🚀 Server started successfully!
  📡 API Base: http://localhost:${PORT}
  📡 WebSocket Stream Active
  🛠️  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});