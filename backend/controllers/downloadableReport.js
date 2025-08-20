const { Parser } = require('json2csv');
const QAReport = require('../models/downloadableReport');
const { generateAndSaveQAReports } = require('../services/qAReportService.js');

const generateGeneralQAReport = async (req, res) => {
  try {
    await generateAndSaveQAReports();

    const reports = await QAReport.find().lean();

    const fields = [
      'teamName', 'periodStart', 'periodEnd',
      'testsDesigned', 'testsExecuted', 'testCoverage',
      'passCount', 'failCount', 'passRate',
      'newDefects', 'defectsClosed', 'defectDensity',
      'severityCritical', 'severityHigh', 'severityMedium', 'severityLow'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(reports);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=general_report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = generateGeneralQAReport;
