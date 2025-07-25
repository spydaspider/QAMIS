const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/discussionThread');

// All routes require auth
router.use(auth);

// List or fetch-by-parent
// GET /api/discussionThread?parentType=Bug[&parentId=<id>]
router.get('/', ctrl.listThreads);

// Get by threadId
router.get('/:threadId', ctrl.getThread);

// Create, comment, reply, delete
router.post('/', ctrl.createThread);
router.post('/:threadId/comments', ctrl.addComment);
router.post('/:threadId/comments/:commentId/reply', ctrl.replyToComment);
router.delete('/:threadId', ctrl.deleteThread);

module.exports = router;
