const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createReport,
  getAllReports,
  getReportById,
  downloadReport,
  deleteReport
} = require('../controllers/downloadableReport.js');

// Multer setup for single file upload under field 'reportFile'
const upload = multer({ storage: multer.memoryStorage() });

// Create a new report (multipart/form-data: metrics + reportFile)
router.post('/', upload.single('reportFile'), createReport);

// List all reports (optional filter by team via ?teamId=)
router.get('/', getAllReports);

// Get metadata of a single report
router.get('/:id', getReportById);

// Download the actual file
router.get('/:id/download', downloadReport);

// Delete a report
router.delete('/:id', deleteReport);

module.exports = router;
