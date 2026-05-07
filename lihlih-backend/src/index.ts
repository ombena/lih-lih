import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import orderRoutes from './routes/orderRoutes';
import storeRoutes from './routes/storeRoutes';
import './workers/orderWorker'; // Start the BullMQ worker

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- SOCKET.IO SETUP ---
// We need a raw HTTP server to attach Socket.io to, instead of just using app.listen()
const httpServer = createServer(app);

import { createAdapter } from '@socket.io/redis-adapter';
import redis from './redisClient';

// Initialize Socket.io with Redis Adapter for horizontal scaling
const pubClient = redis.duplicate();
const subClient = redis.duplicate();

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
  adapter: createAdapter(pubClient, subClient)
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

  // --- PHASE 3: REAL-TIME GPS TRACKING (Redis GeoHashes) ---
  socket.on('driver_location_update', async (data) => {
    const { driverId, lat, lng } = data;
    if (!driverId || !lat || !lng) return;

    try {
      // Store driver location in Redis GeoSet (TTL of 1 hour for active drivers)
      await redis.geoadd('drivers:locations', lng, lat, driverId.toString());
      // Set expiration to clean up inactive drivers (optional, usually handled by separate cleanup or just overwrite)
      
      // console.log(`📍 GPS: Driver #${driverId} at [${lat}, ${lng}]`);
    } catch (err) {
      console.error('❌ Redis GeoAdd Error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});
// -----------------------

import itemRoutes from './routes/itemRoutes';
import reviewRoutes from './routes/reviewRoutes';
import authRoutes from './routes/authRoutes';
import systemRoutes from './routes/systemRoutes';

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/system', systemRoutes);
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