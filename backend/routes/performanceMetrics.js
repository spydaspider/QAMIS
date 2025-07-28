const express = require('express');
// Enable mergeParams to inherit :teamId from parent mount
const router = express.Router({ mergeParams: true });
const {
  createMetrics,
  getLatestMetrics,
  getMetricsHistory,
  upsertTodayMetrics
} = require('../controllers/performanceMetrics.js');

// All routes are relative to /api/teams/:teamId/metrics

// 1. Record a new snapshot (manual or on-demand)
//    POST   /api/teams/:teamId/metrics
router.post('/', createMetrics);

// 2. Upsert today’s snapshot for a team
//    PUT    /api/teams/:teamId/metrics
router.put('/', upsertTodayMetrics);

// 3. Get the latest metrics for a team
//    GET    /api/teams/:teamId/metrics/latest
router.get('/latest', getLatestMetrics);

// 4. Get metrics history for a team (optional: from, to, limit)
//    GET    /api/teams/:teamId/metrics/history
router.get('/history', getMetricsHistory);

module.exports = router;
