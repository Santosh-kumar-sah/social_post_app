/**
 * ============================================================================
 * Pulse Social API — Main Server Entrypoint
 * ============================================================================
 * Express server configured with:
 * - CORS origin filtering for deployment readiness
 * - JSON and URL-encoded payload parsers
 * - RESTful API routes (/api/health, /api/auth, /api/posts)
 * - Mongoose database initialization
 * - Centralized 404 and unhandled error middleware
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * 1. Security & CORS Configuration
 * Accepts requests from the configured frontend origin as well as local Vite dev servers.
 */
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * 2. Request Body Parsing
 * Supports payloads up to 10MB to accommodate base64 image strings if submitted directly.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * 3. Route Mounting
 */
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

/**
 * 4. 404 Route Fallback
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found. Please check API documentation.',
  });
});

/**
 * 5. Centralized Error Handling Middleware
 */
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

/**
 * 6. Database Connection & Server Initialization
 */
connectDB();

app.listen(PORT, () => {
  console.log(`⚡ Pulse Backend API (Node.js/Express) running on port ${PORT}`);
  console.log(`📡 CORS active for: ${CLIENT_URL}`);
});

module.exports = app;
