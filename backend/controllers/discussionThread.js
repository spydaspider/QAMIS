const mongoose = require('mongoose');
const DiscussionThread = require('../models/discussionThread');

// Utility for sending standardized errors
const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// Create a new discussion thread
const createThread = async (req, res) => {
  const { parentType, parentId } = req.body;

  if (!req.user) return sendError(res, 401, 'Authentication required');
  if (!['Bug', 'TestCase'].includes(parentType)) {
    return sendError(res, 400, 'parentType must be either "Bug" or "TestCase"');
  }
  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    return sendError(res, 400, 'parentId is not a valid ObjectId');
  }

  try {
    const thread = await DiscussionThread.create({
      parentType,
      parentId,
      author: req.user._id
    });
    res.status(201).json({ success: true, thread });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Add a top-level comment
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

    const idx = thread.comments.length - 1;
    await thread.populate({ path: `comments.${idx}.author`, select: 'name email' });
    const newComment = thread.comments[idx];

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Helper: recursively find a comment subdocument by id
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

  // 1) Validate user, IDs, and content
  if (!req.user) return sendError(res, 401, 'Authentication required');
  if (![threadId, commentId].every(id => mongoose.Types.ObjectId.isValid(id)))
    return sendError(res, 400, 'Invalid IDs');
  if (!content) return sendError(res, 400, 'Content is required');

  try {
    // 2) Load the thread
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return sendError(res, 404, 'Thread not found');

    // 3) Locate the parent comment (at any depth)
    const parent = findCommentRecursively(thread.comments, commentId);
    if (!parent) return sendError(res, 404, 'Comment not found');

    // 4) Append the reply and save
    parent.replies.push({ author: req.user._id, content });
    await thread.save();

    // 5) Reload/populate to grab the nested author details
    const populated = await DiscussionThread.findById(threadId)
      .populate('comments.author', 'name email')
      .populate('comments.replies.author', 'name email');

    // 6) Re‑find the freshly populated parent and its last reply
    const freshParent = findCommentRecursively(populated.comments, commentId);
    const newReply = freshParent.replies[freshParent.replies.length - 1];

    // 7) Return it
    res.status(201).json({ success: true, reply: newReply });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Delete an entire discussion thread
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

    await DiscussionThread.findByIdAndDelete(threadId);
    res.status(204).end();
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Fetch a full thread (with authors populated)
const getThread = async (req, res) => {
  const { threadId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return sendError(res, 400, 'Invalid threadId');
  }

  try {
    const thread = await DiscussionThread.findById(threadId)
      .populate('author', 'name email')
      .populate('comments.author', 'name email')
      .populate('comments.replies.author', 'name email');

    if (!thread) return sendError(res, 404, 'Thread not found');

    res.json({ success: true, thread });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

module.exports = {
  createThread,
  addComment,
  replyToComment,
  deleteThread,
  getThread
};
