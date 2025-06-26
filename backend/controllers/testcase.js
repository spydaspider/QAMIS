const TestCase = require('../models/testcase.js');

// Create a new test case
const createTestCase = async (req, res) => {
  try {
    const { title, description, steps, author, assignedTeams } = req.body;
    const testCase = new TestCase({ title, description, steps, author, assignedTeams });
    const saved = await testCase.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Get all test cases (optionally filter by team or author)
const getAllTestCases = async (req, res) => {
  try {
    const { teamId, authorId } = req.query;
    const filter = {};
    if (teamId) filter.assignedTeams = teamId;
    if (authorId) filter.author = authorId;
    const testCases = await TestCase.find(filter)
      .populate('author', 'name email')
      .populate('assignedTeams', 'name')
      .populate('executions.team', 'name')
      .populate('executions.executedBy', 'name');
    res.json(testCases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single test case by ID
const getTestCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const testCase = await TestCase.findById(id)
      .populate('author', 'name email')
      .populate('assignedTeams', 'name')
      .populate('executions.team', 'name')
      .populate('executions.executedBy', 'name');
    if (!testCase) return res.status(404).json({ error: 'TestCase not found' });
    res.json(testCase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update a test case (e.g., edit steps, title, assignedTeams)
const updateTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const options = { new: true, runValidators: true };
    const updated = await TestCase.findByIdAndUpdate(id, updates, options);
    if (!updated) return res.status(404).json({ error: 'TestCase not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Delete a test case
const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TestCase.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'TestCase not found' });
    res.json({ message: 'TestCase deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Add an execution entry for a test case
const addExecution = async (req, res) => {
  try {
    const { id } = req.params;
    const execution = req.body; // { team, executedBy?, status, actualResult }
    const testCase = await TestCase.findById(id);
    if (!testCase) return res.status(404).json({ error: 'TestCase not found' });
    testCase.executions.push(execution);
    await testCase.save();
    const newExec = testCase.executions[testCase.executions.length - 1];
    res.status(201).json(newExec);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Get all test cases assigned to a specific team
const getTestCasesByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const testCases = await TestCase.find({ assignedTeams: teamId })
      .populate('author', 'name email')
      .populate('assignedTeams', 'name')
      .populate('executions.team', 'name')
      .populate('executions.executedBy', 'name');
    res.json(testCases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Remove a specific execution record
const removeExecution = async (req, res) => {
  try {
    const { id, execIndex } = req.params; // ID of test case and execution index
    const testCase = await TestCase.findById(id);
    if (!testCase) return res.status(404).json({ error: 'TestCase not found' });
    if (execIndex >= testCase.executions.length) {
      return res.status(400).json({ error: 'Invalid execution index' });
    }
    testCase.executions.splice(execIndex, 1);
    await testCase.save();
    res.json({ message: 'Execution removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
    createTestCase, getAllTestCases, getTestCaseById, updateTestCase, deleteTestCase, addExecution, getTestCasesByTeam, removeExecution 
}