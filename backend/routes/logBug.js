const express = require('express');
const router = express.Router();
const {
  createBug,
  getAllBugs,
  getBugById,
  updateBug,
  deleteBug
} = require('../controllers/logBug.js');

// Create a new bug
router.post('/', createBug);

// Get all bugs (filter by team, reporter, status, severity via query params)
router.get('/', getAllBugs);

// Get a single bug by ID
router.get('/:id', getBugById);

// Update a bug by ID
router.put('/:id', updateBug);

// Delete a bug by ID
router.delete('/:id', deleteBug);

module.exports = router;
