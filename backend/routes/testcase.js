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
} = require('../controllers/testCase.js');  // note correct filename 'testcases.js'

// Create a new test case
router.post('/', createTestCase);

// Get all test cases
router.get('/', getAllTestCases);

// Get all test cases for a team (must be before '/:id' to prevent shadowing)
router.get('/team/:teamId', getTestCasesByTeam);

// Get one by ID
router.get('/:id', getTestCaseById);

// Update by ID
router.put('/:id', updateTestCase);

// Delete by ID
router.delete('/:id', deleteTestCase);

// Add an execution entry
router.post('/:id/executions', addExecution);

// Remove a specific execution record
router.delete('/:id/executions/:execIndex', removeExecution);('/', createTestCase);

// Get all test cases
router.get('/', getAllTestCases);

// Get one by ID
router.get('/:id', getTestCaseById);

// Update by ID
router.put('/:id', updateTestCase);

// Delete by ID
router.delete('/:id', deleteTestCase);

// Add an execution entry
router.post('/:id/executions', addExecution);

// Get all test cases for a team
router.get('/team/:teamId', getTestCasesByTeam);

// Remove a specific execution record
router.delete('/:id/executions/:execIndex', removeExecution);

module.exports = router;
