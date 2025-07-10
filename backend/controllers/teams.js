// controllers/teams.js
const Team = require('../models/teams');
const Experiment = require('../models/experiments');

/**
 * Create a new Team
 */
const createTeam = async (req, res) => {
  try {
    const { name, experiment, students } = req.body;
    const team = new Team({ name, experiment, students });
    const saved = await team.save();

    // Link back to the Experiment
    await Experiment.findByIdAndUpdate(
      experiment,
      { $addToSet: { teams: saved._id } },
      { new: true }
    );

    // Populate before returning
    const populated = await Team.findById(saved._id)
      .populate('experiment', 'title methodology')
      .populate('students', 'username');

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('Error creating team:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all Teams
 */
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('experiment', 'title methodology')
      .populate('students', 'username');
    return res.status(200).json({ success: true, data: teams });
  } catch (err) {
    console.error('Error fetching teams:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get single Team by ID
 */
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id)
      .populate('experiment', 'title methodology')
      .populate('students', 'username');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    console.error('Error fetching team:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Update Team
 */
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const team = await Team.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Return populated version
    const populated = await Team.findById(team._id)
      .populate('experiment', 'title methodology')
      .populate('students', 'username');

    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error('Error updating team:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Delete Team
 */
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete the team
    const team = await Team.findByIdAndDelete(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Remove reference in Experiment
    await Experiment.findByIdAndUpdate(
      team.experiment,
      { $pull: { teams: team._id } }
    );

    // Return the deleted, populated document
    const deletedPopulated = {
      _id: team._id,
      name: team.name,
      experiment: await Experiment.findById(team.experiment, 'title methodology'),
      students: [], // since deleted, student list is moot
    };

    return res.status(200).json({ success: true, data: deletedPopulated });
  } catch (err) {
    console.error('Error deleting team:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Assign Students
 */
const assignStudents = async (req, res) => {
  try {
    const { id } = req.params;        // Team ID
    const { studentIds } = req.body;  // Array of User ObjectIds
    const team = await Team.findByIdAndUpdate(
      id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    )
      .populate('experiment', 'title methodology')
      .populate('students', 'username');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    console.error('Error assigning students:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Remove Students
 */
const removeStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;
    const team = await Team.findByIdAndUpdate(
      id,
      { $pull: { students: { $in: studentIds } } },
      { new: true }
    )
      .populate('experiment', 'title methodology')
      .populate('students', 'username');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    console.error('Error removing students:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  assignStudents,
  removeStudents,
};
