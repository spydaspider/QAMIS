const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
} = require('../controllers/monitorProgress.js');

// Create a new progress report
router.post('/', createReport);

// Get all progress reports (optional filter by team via query ?teamId=...)
router.get('/', getAllReports);

// Get a single progress report by ID
router.get('/:id', getReportById);

// Update a progress report by ID
router.put('/:id', updateReport);

// Delete a progress report by ID
router.delete('/:id', deleteReport);

module.exports = router;
