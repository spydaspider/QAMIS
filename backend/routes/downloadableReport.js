// routes/qaReport.js
const express = require('express');
const router = express.Router();
const generateGeneralQAReport = require('../controllers/downloadableReport'); // or correct controller file path

/**
 * @route   POST /api/qa-reports/general
 * @desc    Generate and download general QA report across teams as CSV
 * @body    { periodStart: ISODate, periodEnd: ISODate }
 */
router.post('/general', generateGeneralQAReport);

module.exports = router;
