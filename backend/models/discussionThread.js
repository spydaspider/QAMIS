const mongoose = require('mongoose');
const { Schema } = mongoose;

// Self-referencing comment schema
const CommentSchema = new Schema({
  author:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content:      { type: String, required: true, trim: true },
  createdAt:    { type: Date, default: Date.now },
  replies:      [this]
}, { _id: true });

const DiscussionThreadSchema = new Schema({
  parentType: { type: String, enum: ['Bug','TestCase'], required: true },
  parentId:   { type: Schema.Types.ObjectId, required: true, refPath: 'parentType' },
  comments:   { type: [CommentSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('DiscussionThread', DiscussionThreadSchema);