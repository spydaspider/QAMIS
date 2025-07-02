const DownloadableReport = require('../models/DownloadableReport');

// Create a new downloadable report (expects multipart/form-data with file)
const createReport = async (req, res) => {
  try {
    const {
      team,
      periodStart,
      periodEnd,
      defectDensity,
      testCoverage,
      averageResolutionTime,
      reportFormat
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'reportFile is required' });
    }

    const contentType = req.file.mimetype;
    const reportFile = req.file.buffer;

    const report = new DownloadableReport({
      team,
      periodStart,
      periodEnd,
      defectDensity,
      testCoverage,
      averageResolutionTime,
      reportFormat,
      reportFile,
      contentType
    });

    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// List all reports, optional filter by team via query ?teamId=
const getAllReports = async (req, res) => {
  try {
    const { teamId } = req.query;
    const filter = {};
    if (teamId) filter.team = teamId;

    const reports = await DownloadableReport.find(filter)
      .populate('team', 'name')
      .sort({ generatedAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get metadata of a single report
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await DownloadableReport.findById(id).populate('team', 'name');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Download the file for a report
const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await DownloadableReport.findById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    res.setHeader('Content-Type', report.contentType);
    const ext = report.reportFormat === 'pdf' ? 'pdf' : 'csv';
    res.setHeader('Content-Disposition', `attachment; filename=report_${id}.${ext}`);
    res.send(report.reportFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DownloadableReport.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  downloadReport,
  deleteReport
};
