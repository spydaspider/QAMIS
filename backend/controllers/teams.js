const Team = require('../models/teams.js');
const Experiment = require('../models/experiments.js');


/**
 * Create a new Team
 */
const createTeam = async (req, res) => {
  try {
    const { name, experiment, students } = req.body;
    const team = new Team({ name, experiment, students });
    const saved = await team.save();
    // Optionally, add to Experiment.teams array
    await Experiment.findByIdAndUpdate(
      experiment,
      { $push: { teams: saved._id } },
      { new: true }
    );
    return res.status(201).json({ success: true, data: saved });
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
    const teams = await Team.find().populate('experiment').populate('students');
    return res.json({ success: true, data: teams });
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
    const team = await Team.findById(id).populate('experiment').populate('students');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    return res.json({ success: true, data: team });
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
    const team = await Team.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    return res.json({ success: true, data: team });
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
    const team = await Team.findByIdAndDelete(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    // Optionally, remove from Experiment.teams array
    await Experiment.findByIdAndUpdate(
      team.experiment,
      { $pull: { teams: team._id } }
    );
    return res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    console.error('Error deleting team:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
const assignStudents = async(req, res)=>{
    try {
    const { id } = req.params;              // Team ID
    const { studentIds } = req.body;        // Array of User ObjectIds
    const team = await Team.findByIdAndUpdate(
      id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    ).populate('students');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    return res.json({ success: true, data: team });
  } catch (err) {
    console.error('Error assigning students:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}
const removeStudents = async(req, res)=>{
    try {
    const { id } = req.params;              // Team ID
    const { studentIds } = req.body;        // Array of User ObjectIds
    const team = await Team.findByIdAndUpdate(
      id,
      { $pull: { students: { $in: studentIds } } },
      { new: true }
    ).populate('students');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    return res.json({ success: true, data: team });
  } catch (err) {
    console.error('Error removing students:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }

    
}
module.exports = {
    createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam, assignStudents, removeStudents
}
