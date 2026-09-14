const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const produceRoutes = require('./routes/produce.routes');
const uploadRoutes = require('./routes/upload.routes');
const orderRoutes = require('./routes/order.routes');
const testRoutes = require('./routes/test.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in production to avoid blocker
  },
  credentials: true,
}));

// Body parser
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'API is running',
    },
  });
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/test', testRoutes);

// Catch-all 404 route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
