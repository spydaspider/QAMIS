const mongoose = require('mongoose');
const { Schema } = mongoose;

// Recursive CommentSchema for embedded subdocuments
const CommentSchema = new Schema({
  author:    { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  content:   { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
  replies:   []
}, { _id: true });

// Add recursive subdocument for replies
CommentSchema.add({ replies: [CommentSchema] });

// DiscussionThread schema, embedding CommentSchema
const DiscussionThreadSchema = new Schema({
  parentType: { type: String, enum: ['Bug', 'TestCase'], required: true },
  parentId:   { type: Schema.Types.ObjectId, refPath: 'parentType', required: true },
  author:     { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  comments:   { type: [CommentSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('DiscussionThread', DiscussionThreadSchema);
