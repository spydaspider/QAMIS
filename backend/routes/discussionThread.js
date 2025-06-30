const express = require('express');
const router = express.Router();
const {
  createThread,
  addComment,
  replyToComment,
  getThread
} = require('../controllers/discussionThread.js');

// Create a new discussion thread
// POST   /api/threads
router.post('/', createThread);

// Add a top-level comment to a thread
// POST   /api/threads/:threadId/comments
router.post('/:threadId/comments', addComment);

// Reply to an existing comment in a thread
// POST   /api/threads/:threadId/comments/:commentId/reply
router.post('/:threadId/comments/:commentId/reply', replyToComment);

// Fetch a full discussion thread (with comments & replies)
// GET    /api/threads/:threadId
router.get('/:threadId', getThread);

module.exports = router;
