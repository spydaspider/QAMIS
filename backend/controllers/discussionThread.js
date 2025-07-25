// controllers/discussionThread.js

const mongoose = require('mongoose');
const DiscussionThread = require('../models/discussionThread');

// Utility for standardized errors
const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

/**
 * POST   /api/discussionThread
 * Create a new thread for a given parent.
 */
const createThread = async (req, res) => {
  const { parentType, parentId } = req.body;

  if (!req.user) return sendError(res, 401, 'Authentication required');
  if (!['Bug', 'TestCase'].includes(parentType)) {
    return sendError(res, 400, 'parentType must be "Bug" or "TestCase"');
  }
  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    return sendError(res, 400, 'parentId is not a valid ObjectId');
  }

  try {
    let thread = await DiscussionThread.create({
      parentType,
      parentId,
      author: req.user._id
    });
    // populate right away
    thread = await DiscussionThread.findById(thread._id)
      .populate('author', 'name email')
      .populate('comments.author', 'name email')
      .populate('comments.replies.author', 'name email');
    res.status(201).json({ success: true, thread });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

/**
 * POST   /api/discussionThread/:threadId/comments
 * Add a top‑level comment.
 */
const addComment = async (req, res) => {
  const { threadId } = req.params;
  const { content } = req.body;

  if (!req.user) return sendError(res, 401, 'Authentication required');
  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return sendError(res, 400, 'Invalid threadId');
  }
  if (!content) {
    return sendError(res, 400, 'Content is required');
  }

  try {
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return sendError(res, 404, 'Thread not found');

    thread.comments.push({ author: req.user._id, content });
    await thread.save();

    // re-fetch the last comment with populated author
    const populated = await DiscussionThread.findById(threadId)
      .populate('comments.author', 'name email');
    const newComment = populated.comments.pop();

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

/**
 * POST   /api/discussionThread/:threadId/comments/:commentId/reply
 * Reply to a comment (recursively).
 */
function findCommentRecursively(docs, id) {
  for (let doc of docs) {
    if (doc._id.toString() === id) return doc;
    const found = findCommentRecursively(doc.replies, id);
    if (found) return found;
  }
  return null;
}

const replyToComment = async (req, res) => {
  const { threadId, commentId } = req.params;
  const { content } = req.body;

  if (!req.user) return sendError(res, 401, 'Authentication required');
  if (![threadId, commentId].every(id => mongoose.Types.ObjectId.isValid(id))) {
    return sendError(res, 400, 'Invalid IDs');
  }
  if (!content) return sendError(res, 400, 'Content is required');

  try {
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return sendError(res, 404, 'Thread not found');

    const parent = findCommentRecursively(thread.comments, commentId);
    if (!parent) return sendError(res, 404, 'Comment not found');

    parent.replies.push({ author: req.user._id, content });
    await thread.save();

    // re-fetch & populate entire tree
    const populated = await DiscussionThread.findById(threadId)
      .populate('comments.author', 'name email')
      .populate('comments.replies.author', 'name email');

    const freshParent = findCommentRecursively(populated.comments, commentId);
    const newReply = freshParent.replies[freshParent.replies.length - 1];

    res.status(201).json({ success: true, reply: newReply });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

/**
 * DELETE /api/discussionThread/:threadId
 * Delete an entire thread (only by its author).
 */
const deleteThread = async (req, res) => {
  const { threadId } = req.params;

  if (!req.user) return sendError(res, 401, 'Authentication required');
  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return sendError(res, 400, 'Invalid threadId');
  }

  try {
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return sendError(res, 404, 'Thread not found');
    if (thread.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Forbidden: cannot delete this thread');
    }
    await thread.deleteOne();
    res.status(204).end();
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

/**
 * GET    /api/discussionThread/:threadId
 * Fetch a single thread by its _id.
 */
const getThread = async (req, res) => {
  const { threadId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return sendError(res, 400, 'Invalid threadId');
  }

  try {
    const thread = await DiscussionThread.findById(threadId)
      .populate('author', 'name email')
      .populate({
        path: 'comments.author',
        select: 'name email'
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'author',
          select: 'name email'
        }
      })
      .populate({
        path: 'comments.replies.replies',
        populate: {
          path: 'author',
          select: 'name email'
        }
      });

    if (!thread) return sendError(res, 404, 'Thread not found');
    res.json({ success: true, thread });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};


/**
 * GET    /api/discussionThread
 * Query‐style fetch: ?parentType=Bug[&parentId=<id>]
 * - If only parentType, returns all threads of that type.
 * - If both parentType & parentId, returns single thread or 404.
 */
const listThreads = async (req, res) => {
  const { parentType, parentId } = req.query;
  if (!['Bug', 'TestCase'].includes(parentType)) {
    return sendError(res, 400, 'parentType query required');
  }

  try {
    const filter = { parentType };
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return sendError(res, 400, 'parentId invalid');
      }
      filter.parentId = parentId;
    }

  const threads = await DiscussionThread.find(filter)
  .populate('author', 'name email')
  .populate({
    path: 'comments.author',
    select: 'name email'
  })
  .populate({
    path: 'comments.replies',
    populate: {
      path: 'author',
      select: 'name email'
    }
  })
  .populate({
    path: 'comments.replies.replies',
    populate: {
      path: 'author',
      select: 'name email'
    }
  });

    if (parentId) {
      // return single or 404
      if (!threads.length) return sendError(res, 404, 'Thread not found');
      return res.json({ success: true, thread: threads[0] });
    }

    // return array
    res.json({ success: true, threads });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

module.exports = {
  createThread,
  addComment,
  replyToComment,
  deleteThread,
  getThread,
  listThreads
};
