const express = require('express');
const router = express.Router();
const {
  createTestCase,
  getAllTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase,
  addExecution,
  getTestCasesByTeam,
  removeExecution
} = require('../controllers/testCase.js');

// Create a new test case
router.post('/', createTestCase);

// Get all test cases
router.get('/', getAllTestCases);

// Get all test cases for a team
router.get('/team/:teamId', getTestCasesByTeam);

// Get one by ID
router.get('/:id', getTestCaseById);

// Update by ID
router.patch('/:id', updateTestCase);

// Delete by ID
router.delete('/:id', deleteTestCase);

// Add an execution entry
router.post('/:id/executions', addExecution);

// Remove a specific execution record
router.delete('/:id/executions/:execIndex', removeExecution);

module.exports = router;