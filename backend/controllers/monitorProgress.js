const ProgressReport = require('../models/ProgressReport');

// Create a new progress report
const createReport = async (req, res) => {
  try {
    const {
      team,
      periodStart,
      periodEnd,
      activeBugsCount = 0,
      testExecutionsCount = 0,
      passedExecutionsCount = 0,
      failedExecutionsCount = 0,
      newDefectsCount = 0,
      defectResolutionCount = 0,
      passRate,
      defectDensity = 0
    } = req.body;

    // Optional: compute passRate if not provided
    const computedPassRate = passRate !== undefined
      ? passRate
      : (testExecutionsCount > 0 ? passedExecutionsCount / testExecutionsCount : 0);

    const report = new ProgressReport({
      team,
      periodStart,
      periodEnd,
      activeBugsCount,
      testExecutionsCount,
      passedExecutionsCount,
      failedExecutionsCount,
      newDefectsCount,
      defectResolutionCount,
      passRate: computedPassRate,
      defectDensity
    });

    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Get all progress reports, optionally filter by team
const getAllReports = async (req, res) => {
  try {
    const { teamId } = req.query;
    const filter = {};
    if (teamId) filter.team = teamId;

    const reports = await ProgressReport.find(filter)
      .populate('team', 'name')
      .sort({ periodStart: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single progress report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ProgressReport.findById(id).populate('team', 'name');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update a progress report by ID
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Recompute passRate if counts changed
    if (
      updates.passedExecutionsCount !== undefined ||
      updates.testExecutionsCount !== undefined
    ) {
      const passed = updates.passedExecutionsCount;
      const total = updates.testExecutionsCount;
      updates.passRate = total > 0 ? passed / total : 0;
    }

    const options = { new: true, runValidators: true };
    const updated = await ProgressReport.findByIdAndUpdate(id, updates, options);
    if (!updated) return res.status(404).json({ error: 'Report not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Delete a progress report by ID
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProgressReport.findByIdAndDelete(id);
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
  updateReport,
  deleteReport
};
