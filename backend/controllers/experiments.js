const Experiment = require('../models/experiments');
const createExperiment = async(req,res)=>{
    try {
    const { title, description, methodology, startDate, endDate } = req.body;
    const experiment = new Experiment({ title, description, methodology, startDate, endDate });
    const saved = await experiment.save();
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error creating experiment:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
    
}
const getAllExperiments = async(req, res) =>{
    try {
    const experiments = await Experiment.find().populate('teams');
    return res.json({ success: true, data: experiments });
  } catch (err) {
    console.error('Error fetching experiments:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }

}
const getExperimentById = async(req, res) =>{
    try {
    const { id } = req.params;
    const experiment = await Experiment.findById(id, 'methodology startDate endDate teams').populate('teams','name members');
    if (!experiment) {
      return res.status(404).json({ success: false, message: 'Experiment not found' });
    }
    return res.json({ success: true, data: experiment });
  } catch (err) {
    console.error('Error fetching experiment:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}
const updateExperiment = async(req, res)=>{
    try {
    const { id } = req.params;
    const updates = req.body;
    const experiment = await Experiment.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!experiment) {
      return res.status(404).json({ success: false, message: 'Experiment not found' });
    }
    return res.json({ success: true, data: experiment });
  } catch (err) {
    console.error('Error updating experiment:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}
const deleteExperiment = async(req, res)=>{
    try {
    const { id } = req.params;
    const experiment = await Experiment.findByIdAndDelete(id);
    if (!experiment) {
      return res.status(404).json({ success: false, message: 'Experiment not found' });
    }
    return res.json({ success: true, message: 'Experiment deleted' });
  } catch (err) {
    console.error('Error deleting experiment:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}
module.exports = {
    createExperiment, getAllExperiments, getExperimentById, updateExperiment, deleteExperiment
}
