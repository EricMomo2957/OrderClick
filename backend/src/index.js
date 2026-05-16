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

// --- 2. MIDDLEWARE & CORS ---
app.use(morgan('dev')); 

// Unified CORS Configuration supporting standard Express routing and HTTP verbs
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 3. STATIC FOLDERS ---
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
})); 

// --- 4. CREATE UNIFIED HTTP + WEBSOCKET SERVER ---
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

// Log and manage client handshakes
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to real-time sync: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// --- 5. ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', manageCustomerRoutes); 
app.use('/api/events', eventRoutes); 
app.use('/api/announcements', announcementRoutes); 

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
// Bound to httpServer instead of basic app framework engine instance execution
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
  🚀 Server started successfully!
  📡 URL: http://localhost:${PORT}
  🛠️  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});