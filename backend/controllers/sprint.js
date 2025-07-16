// controllers/sprintController.js
const SprintModel = require('../models/sprint');

/** Create a new sprint period */
async function createSprint(req, res) {
  try {
    const { team, name, periodStart, periodEnd, codeSizeKloc } = req.body;
    const sprint = new SprintModel({ team, name, periodStart, periodEnd, codeSizeKloc });
    await sprint.save();
    res.status(201).json(sprint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Retrieve all sprints, optionally filtered by team */
async function getSprints(req, res) {
  try {
    const filter = {};
    if (req.query.team) filter.team = req.query.team;
    const sprints = await SprintModel.find(filter).populate('team').sort({ periodStart: -1 });
    res.json(sprints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/** Get details of a single sprint by ID */
async function getSprintById(req, res) {
  try {
    const sprint = await SprintModel.findById(req.params.id).populate('team');
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/** Update sprint details */
async function updateSprint(req, res) {
  try {
    const updates = { ...req.body };
    const sprint = await SprintModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    res.json(sprint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Delete a sprint record */
async function deleteSprint(req, res) {
  try {
    const sprint = await SprintModel.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint
};
