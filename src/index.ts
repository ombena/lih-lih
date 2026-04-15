import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import storeRoutes from './routes/storeRoutes';
import orderRoutes from './routes/orderRoutes'; // New Import

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===
app.use(cors()); 
app.use(express.json());

// Simple logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// === ROUTES ===

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'success', message: '🚀 LihLih API is live' });
});

// Modular Routes
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes); // New Route Registration

// === ERROR HANDLING ===
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`✅ LihLih Backend: http://localhost:${PORT}`);
  console.log(`=========================================`);
});