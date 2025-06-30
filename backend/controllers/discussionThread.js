const mongoose = require('mongoose');
const DiscussionThread = require('../models/discussionThread');

// Utility for sending standardized errors
const sendError = (res, status, message) => 
  res.status(status).json({ success: false, message });

// Create a new discussion thread
const createThread = async (req, res) => {
  const { parentType, parentId } = req.body;

  if (!['Bug', 'TestCase'].includes(parentType)) {
    return sendError(res, 400, 'parentType must be either "Bug" or "TestCase"');
  }
  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    return sendError(res, 400, 'parentId is not a valid ObjectId');
  }

  try {
    const thread = await DiscussionThread.create({ parentType, parentId });
    res.status(201).json({ success: true, thread });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Add a top-level comment
    const addComment = async (req, res) => {
  const { threadId } = req.params;
  const { author, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return sendError(res, 400, 'Invalid threadId');
  }
  if (!content || !author) {
    return sendError(res, 400, 'Both author and content are required');
  }

  try {
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return sendError(res, 404, 'Thread not found');

    thread.comments.push({ author, content });
    await thread.save();

    res.status(201).json({ success: true, thread });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Reply to an existing comment
const replyToComment = async (req, res) => {
  const { threadId, commentId } = req.params;
  const { author, content } = req.body;

  if (![threadId, commentId].every(id => mongoose.Types.ObjectId.isValid(id))) {
    return sendError(res, 400, 'Invalid threadId or commentId');
  }
  if (!content || !author) {
    return sendError(res, 400, 'Both author and content are required');
  }

  try {
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return sendError(res, 404, 'Thread not found');

    const parent = thread.comments.id(commentId);
    if (!parent) return sendError(res, 404, 'Comment not found');

    parent.replies.push({ author, content });
    await thread.save();

    res.status(201).json({ success: true, thread });
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
      .populate('comments.author', 'name email')
      .populate('comments.replies.author', 'name email');

    if (!thread) return sendError(res, 404, 'Thread not found');

    res.json({ success: true, thread });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};
module.exports = {createThread, addComment, replyToComment, getThread}
