const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schema for a single discussion comment (with nesting)
const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  replies: [this] // self-reference for nested replies
}, { _id: true });

// Top-level DiscussionThread schema
const DiscussionThreadSchema = new Schema({
  // Link to parent entity: either a Bug or a TestCase
  parentType: {
    type: String,
    enum: ['Bug', 'TestCase'],
    required: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'parentType'
  },
  comments: {
    type: [CommentSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('DiscussionThread', DiscussionThreadSchema);
