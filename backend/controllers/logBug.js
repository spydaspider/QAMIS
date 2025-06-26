const Bug = require('../models/Bug');

// Create a new bug
const createBug = async (req, res) => {
  try {
    const { title, description, reproductionSteps, severity, screenshots, reporter, team } = req.body;
    const bug = new Bug({ title, description, reproductionSteps, severity, screenshots, reporter, team });
    const saved = await bug.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Get all bugs (optionally filter by team, reporter, status, or severity)
const getAllBugs = async (req, res) => {
  try {
    const { teamId, reporterId, status, severity } = req.query;
    const filter = {};
    if (teamId) filter.team = teamId;
    if (reporterId) filter.reporter = reporterId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    const bugs = await Bug.find(filter)
      .populate('reporter', 'name email')
      .populate('team', 'name')
      .sort({ createdAt: -1 });
    res.json(bugs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single bug by ID
const getBugById = async (req, res) => {
  try {
    const { id } = req.params;
    const bug = await Bug.findById(id)
      .populate('reporter', 'name email')
      .populate('team', 'name');
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update a bug (e.g., status, severity, description)
const updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const options = { new: true, runValidators: true };
    const updated = await Bug.findByIdAndUpdate(id, updates, options);
    if (!updated) return res.status(404).json({ error: 'Bug not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Delete a bug
const deleteBug = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Bug.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Bug not found' });
    res.json({ message: 'Bug deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = {createBug, getAllBugs, getBugById, updateBug, deleteBug }