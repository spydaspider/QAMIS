const Bug = require('../models/logBug');

// Create a new bug, and record the initial “open” status entry
const createBug = async (req, res) => {
  try {
    let { title, description, reproductionSteps, severity, reporter, team } = req.body;
    if (typeof reproductionSteps === 'string') {
      try {
        reproductionSteps = JSON.parse(reproductionSteps);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON in reproductionSteps' });
      }
    }
    if (!Array.isArray(reproductionSteps) || reproductionSteps.length === 0) {
      return res.status(400).json({ error: 'reproductionSteps must be a non-empty array' });
    }

    // Build screenshots
    const screenshots = (req.files || []).map(f => ({
      data: f.buffer,
      contentType: f.mimetype
    }));

    // Instantiate with currentStatus default = 'open'
    const bug = new Bug({
      title,
      description,
      reproductionSteps,
      severity,
      screenshots,
      reporter,
      team
    });

    // Manually seed the first history entry
    bug._updatingUserId = reporter;
    bug._statusComment  = 'Initial report';
    bug.currentStatus   = 'open';  // though schema default covers it

    const saved = await bug.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

// Change only the bug’s status (so history is tracked)
const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, comment } = req.body;
    // Optional: validate newStatus against your enum
    const bug = await Bug.findById(id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });

    // Pass info to pre-save hook
    bug._updatingUserId = req.user._id;  // assume you have auth middleware
    bug._statusComment  = comment || '';

    // This triggers the pre-save to push into statusHistory
    bug.currentStatus = newStatus;
    const updated = await bug.save();
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

// Update other fields (description, severity, etc.) but NOT status
const updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    // Remove any attempt to change status through this route
    const { currentStatus, statusHistory, ...fields } = req.body;
    const bug = await Bug.findById(id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });

    Object.assign(bug, fields);
    const saved = await bug.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

// The rest remain unchanged:

const getAllBugs = async (req, res) => {
  try {
    const { teamId, reporterId, status, severity } = req.query;
    const filter = {};
    if (teamId)     filter.team    = teamId;
    if (reporterId) filter.reporter = reporterId;
    if (status)     filter.currentStatus = status;
    if (severity)   filter.severity = severity;

    const bugs = await Bug.find(filter)
      .populate('reporter', 'name email')
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    return res.json(bugs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('team', 'name');
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    return res.json(bug);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteBug = async (req, res) => {
  try {
    const deleted = await Bug.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Bug not found' });
    return res.json({ message: 'Bug deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBug,
  getAllBugs,
  getBugById,
  changeStatus,
  updateBug,
  deleteBug
};
