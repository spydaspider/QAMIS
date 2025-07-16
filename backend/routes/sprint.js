

// routes/sprintRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint
} = require('../controllers/sprintController');
const auth = require('../middleware/auth');

// All sprint routes require authentication
type
router.use(auth);

// Create a new sprint
router.post('/', createSprint);

// Retrieve all sprints (optionally filtered by team)
router.get('/', getSprints);

// Retrieve a single sprint by ID
router.get('/:id', getSprintById);

// Update a sprint
router.put('/:id', updateSprint);

// Delete a sprint
router.delete('/:id', deleteSprint);

module.exports = router;
