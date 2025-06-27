const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createBug,
  getAllBugs,
  getBugById,
  changeStatus,
  updateBug,
  deleteBug
} = require('../controllers/logBug.js');

// Multer setup for in-memory screenshot uploads (max 5 files)
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 5 } });

// Create a new bug with screenshots
router.post('/', upload.array('screenshots'), createBug);

// Get all bugs (filter by team, reporter, status, severity via query params)
router.get('/', getAllBugs);

// Get a single bug by ID
router.get('/:id', getBugById);

// Change bug status (records history)
router.patch('/:id/status', changeStatus);

// Update bug fields (excluding status)
router.put('/:id', updateBug);

// Delete a bug by ID
router.delete('/:id', deleteBug);

module.exports = router;