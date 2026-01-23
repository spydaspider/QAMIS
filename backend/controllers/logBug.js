// controllers/logBug.js
const BugModel = require('../models/logBug.js');

/** Create a new bug report */
async function createBug(req, res) {
  try {
    console.log('REQ.BODY:', req.body);
    console.log('REQ.FILES:', req.files);

    const {
      title,
      description,
      reproductionSteps,
      severity,
      team
    } = req.body;

    if (!title || !description || !reproductionSteps || !team) {
      throw new Error('Required fields are missing');
    }

    // Parse reproduction steps (FormData sends strings)
    const parsedSteps =
      typeof reproductionSteps === 'string'
        ? JSON.parse(reproductionSteps)
        : reproductionSteps;

    // Map uploaded screenshots (Cloudinary URLs)
    const screenshots = req.files
      ? req.files.map(file => ({
          imageUrl: file.path   // Cloudinary URL
        }))
      : [];

    const bug = new BugModel({
      title,
      description,
      reproductionSteps: parsedSteps,
      severity,
      team,
      screenshots,
      reporter: req.user._id
    });

    await bug.save();
    await bug.populate('reporter team');

    res.status(201).json(bug);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Everything else stays the same */
async function getBugs(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.currentStatus = req.query.status;
    if (req.query.team) filter.team = req.query.team;

    const bugs = await BugModel.find(filter)
      .populate('reporter team')
      .exec();

    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

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

async function updateBug(req, res) {
  try {
    const updates = { ...req.body };
    delete updates.currentStatus;

    const bug = await BugModel.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('reporter team')
      .exec();

    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function changeBugStatus(req, res) {
  try {
    const { status, comment } = req.body;
    const bug = await BugModel.findById(req.params.id);

    if (!bug) return res.status(404).json({ error: 'Bug not found' });

    bug._updatingUserId = req.user._id;
    bug._statusComment = comment;
    bug.currentStatus = status;

    await bug.save();
    await bug.populate('reporter team statusHistory.changedBy');

    res.json(bug);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

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
