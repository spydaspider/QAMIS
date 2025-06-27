const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schema for each reproduction step
const ReproStepSchema = new Schema({
  stepNumber: { type: Number, required: true },
  action:     { type: String, required: true, trim: true }
}, { _id: false });

// NEW: Sub-schema for in-DB screenshots
const ScreenshotSchema = new Schema({
  data:        { type: Buffer, required: true },   // raw bytes
  contentType: { type: String, required: true }    // e.g. 'image/png'
}, { _id: false });
const StatusEntrySchema = new Schema({
  status: {
    type: String,
    enum: ['open', 'in review', 'resolved', 'closed'],
    required: true
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  comment: {
    type: String,
    trim: true
  }
}, { _id: false });


const BugSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  reproductionSteps: {
    type: [ReproStepSchema],
    required: true,
    validate: arr => Array.isArray(arr) && arr.length > 0
  },
  severity: {
    type: String,
    enum: ['low','medium','high','critical'],
    default: 'medium'
  },
  // ←—— here’s the change:
  screenshots: {
    type: [ScreenshotSchema],   // now holds Buffers + MIME types
    default: []
  },
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  currentStatus: {
    type: String,
    enum: ['open', 'in review', 'resolved', 'closed'],
    default: 'open',
    required: true
  },
  statusHistory: {
    type: [StatusEntrySchema],
    default: []
  },
}, { timestamps: true });

BugSchema.pre('save', function(next) {
  if (this.isModified('currentStatus')) {
    this.statusHistory.push({
      status: this.currentStatus,
      changedBy: this._updatingUserId,  // should be set in controller
      comment: this._statusComment      // optional, set in controller
    });
  }
  next();
});

module.exports = mongoose.model('Bug', BugSchema);