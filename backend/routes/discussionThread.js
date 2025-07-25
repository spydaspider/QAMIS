const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const {
  createThread,
  addComment,
  replyToComment,
  deleteThread,
  getThread
} = require('../controllers/discussionThread.js');

// Create a new discussion thread
// POST   /api/discussionThread
router.use(auth);
router.post('/', createThread);

// Add a top-level comment to a thread
// POST   /api/discussionThread/:threadId/comments
router.post('/:threadId/comments', addComment);

// Reply to an existing comment in a thread
// POST   /api/discussionThread/:threadId/comments/:commentId/reply
router.post('/:threadId/comments/:commentId/reply', replyToComment);

// Fetch a full discussion thread (with comments & replies)
// GET    /api/discussionThread/:threadId
router.get('/:threadId', getThread);
// DELETE /api/discussionThread/:threadId
router.delete('/:threadId', deleteThread);


module.exports = router;
