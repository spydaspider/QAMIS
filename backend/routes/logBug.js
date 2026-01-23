const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const auth = require('../middleware/auth.js');
const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  changeBugStatus,
  deleteBug
} = require('../controllers/logBug.js');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bug-screenshots',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage });

// All routes require authentication
router.use(auth);

// Create a new bug (with screenshots)
router.post('/', upload.array('screenshots', 5), createBug);

// Retrieve all bugs
router.get('/', getBugs);

// Retrieve a specific bug
router.get('/:id', getBugById);

// Update bug details
router.put('/:id', updateBug);

// Change bug status
router.patch('/:id/status', changeBugStatus);

// Delete bug
router.delete('/:id', deleteBug);

module.exports = router;
