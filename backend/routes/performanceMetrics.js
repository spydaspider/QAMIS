const express = require('express');
const router = express.Router();
const {
  createMetrics,
  getLatestMetrics,
  getMetricsHistory,
  upsertTodayMetrics
} = require('../controllers/performanceMetrics.js');

// Record a new snapshot (optional manual create)
// POST   /api/metrics
router.post('/', createMetrics);

// Upsert today’s snapshot for a team (auto-calc)
// PUT    /api/metrics/:teamId/upsert-today
router.put('/:teamId/upsert-today', upsertTodayMetrics);

// Get the latest metrics for a team
// GET    /api/metrics/:teamId/latest
router.get('/:teamId/latest', getLatestMetrics);

// Get metrics history for a team (optional: from, to, limit)
// GET    /api/metrics/:teamId/history
router.get('/:teamId/history', getMetricsHistory);

module.exports = router;