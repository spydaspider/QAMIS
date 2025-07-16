const  auth  = require('../middleware/auth.js');
const express = require('express');
const router = express.Router();
const {createBug, getBugs, getBugById, updateBug, changeBugStatus, deleteBug} = require('../controllers/logBug.js');

// All routes require authentication
router.use(auth);

// Create a new bug
router.post('/', createBug);

// Retrieve all bugs, with optional filters
router.get('/', getBugs);

// Retrieve a specific bug by ID
router.get('/:id', getBugById);

// Update bug details (excluding status)
router.put('/:id', updateBug);

// Change bug status (open, in review, resolved, closed)
router.patch('/:id/status', changeBugStatus);

// Delete a bug
router.delete('/:id', deleteBug);

module.exports = router;
