/**
 * System Health & Diagnostics Route (/api/health)
 * 
 * Verifies backend process availability and active MongoDB connection status.
 */

const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

router.get('/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    service: 'Pulse Social API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
