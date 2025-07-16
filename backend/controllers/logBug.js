const BugModel = require('../models/logBug.js');

/** Create a new bug report */
async function createBug(req, res) {
  try {
    const bug = new BugModel({
      ...req.body,
      reporter: req.user._id
    });
    await bug.save();
    res.status(201).json(bug);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Get all bugs (optionally filter by status or team) */
async function getBugs(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.currentStatus = req.query.status;
    if (req.query.team) filter.team = req.query.team;
    const bugs = await BugModel.find(filter).populate('reporter team').exec();
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/** Get a single bug by ID */
async function getBugById(req, res) {
  try {
    const bug = await BugModel.findById(req.params.id)
      .populate('reporter team statusHistory.changedBy')
      .exec();
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/** Update bug details except status */
async function updateBug(req, res) {
  try {
    const updates = { ...req.body };
    delete updates.currentStatus;
    const bug = await BugModel.findByIdAndUpdate(req.params.id, updates, { new: true }).exec();
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Change the status of a bug and record who changed it */
async function changeBugStatus(req, res) {
  try {
    const { status, comment } = req.body;
    const bug = await BugModel.findById(req.params.id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });

    // Attach metadata for middleware
    bug._updatingUserId = req.user._id;
    bug._statusComment = comment;
    bug.currentStatus = status;

    await bug.save();
    res.json(bug);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Delete a bug report */
async function deleteBug(req, res) {
  try {
    const result = await BugModel.findByIdAndDelete(req.params.id).exec();
    if (!result) return res.status(404).json({ error: 'Bug not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  changeBugStatus,
  deleteBug
};
