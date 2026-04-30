import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import orderRoutes from './routes/orderRoutes';
import storeRoutes from './routes/storeRoutes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- SOCKET.IO SETUP ---
// We need a raw HTTP server to attach Socket.io to, instead of just using app.listen()
const httpServer = createServer(app);

// Initialize Socket.io with CORS settings to allow your React store app to connect
const io = new Server(httpServer, {
  cors: {
    origin: "*", // En production, mettez l'URL exacte de votre dashboard React
    methods: ["GET", "POST"]
  }
});

// Make the 'io' instance available to our route controllers via the Express req object
app.use((req, res, next) => {
  req.app.set('io', io);
  next();
});

// Socket connection listener for debugging and store-room joining
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // When a store tablet connects, it will emit 'join_store_room' with its store ID.
  // This ensures we only send alarms to the correct restaurant.
  socket.on('join_store_room', (storeId) => {
    socket.join(`store_${storeId}`);
    console.log(`🏠 Socket ${socket.id} joined room: store_${storeId}`);
  });

  socket.on('join_client_room', (clientId) => {
    socket.join(`client_${clientId}`);
    console.log(`📱 Client ${socket.id} joined room: client_${clientId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});
// -----------------------

import itemRoutes from './routes/itemRoutes';
import reviewRoutes from './routes/reviewRoutes';

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'LihLih API is running' });
});

// Start the server using httpServer.listen instead of app.listen
httpServer.listen(port, () => {
  console.log(`🚀 LihLih Server running on port ${port}`);
});