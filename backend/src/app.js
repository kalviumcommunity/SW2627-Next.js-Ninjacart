const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const produceRoutes = require('./routes/produce.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use('/api/test', testRoutes);
app.use('/api/produce', produceRoutes);

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
