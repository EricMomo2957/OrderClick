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
import adminRoutes from './routes/adminRoutes.js'; // Unified Administrative & Audit Tracking Routes
import documentRoutes from './routes/documentRoutes.js'; // Document Upload & Management Routes (ES Module Import)
import notificationRoutes from './routes/notificationRoutes.js'; // INTEGRATED ROUTE IMPORT
import saleRoutes from './routes/salesRoutes.js'; //  Added the 's' to match your directory!
import salesRoutes from './routes/salesRoutes.js';
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

// Define allowed local development origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

// Unified CORS Configuration supporting shifts between ports 5173 and 5174
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 3. STATIC FILE SERVER ---
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), {
  setHeaders: (res, path, stat) => {
    const origin = res.req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
  }
})); 

// --- 4. CREATE UNIFIED HTTP + WEBSOCKET PLATFORM ---
const httpServer = createServer(app);

// Initialize Socket.io attached directly to the wrapped native HTTP platform
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// CRITICAL MIDDLEWARE: Attach Socket.io instance to every request context
app.use((req, res, next) => {
  req.io = io; 
  next();
});

// Bind WebSocket instances globally across application request contexts (Fallback reference)
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

// 🛠️ FALLBACK ROUTE INTERCEPTOR FOR DASHBOARD TOP PRODUCTS
// Redirects /api/products/admin/top-products directly into the admin router pipeline to resolve the 404 error
app.use('/api/products/admin', adminRoutes);

app.use('/api/orders', orderRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/announcements', announcementRoutes); 
app.use('/api/notifications', notificationRoutes); // MOUNTED NOTIFICATION SYSTEM ROUTES

// Document Management Base Route Pipeline Setup
app.use('/api/documents', documentRoutes); 

// --- Core Administration Operations Routers ---
app.use('/api/admin', adminRoutes); 

// Separated cleanly to keep directory routes modular
app.use('/api/admin/customers-directory', manageCustomerRoutes); 
  
// Ensure this exact base path matches your axios call!
app.use('/api/sales', salesRoutes);

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
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
  🚀 Server started successfully!
  📡 API Base: http://localhost:${PORT}
  📡 WebSocket Stream Active
  🛠️  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});