const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReproStepSchema = new Schema({
  stepNumber: { type: Number, required: true },
  action:     { type: String, required: true, trim: true }
}, { _id: false });

const ScreenshotSchema = new Schema({
  data:        { type: Buffer, required: true },
  contentType: { type: String, required: true }
}, { _id: false });

const StatusEntrySchema = new Schema({
  status:    { type: String, enum: ['open','in review','resolved','closed'], required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
  comment:   { type: String, trim: true }
}, { _id: false });

const BugSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  reproductionSteps: { type: [ReproStepSchema], required: true, validate: arr => Array.isArray(arr) && arr.length > 0 },
  severity: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  screenshots: { type: [ScreenshotSchema], default: [] },
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  currentStatus: { type: String, enum: ['open','in review','resolved','closed'], default: 'open', required: true },
  statusHistory: { type: [StatusEntrySchema], default: [] }
}, { timestamps: true });

BugSchema.pre('save', function(next) {
  if (this.isModified('currentStatus') && this._updatingUserId) {
    this.statusHistory.push({
      status: this.currentStatus,
      changedBy: this._updatingUserId,
      comment: this._statusComment || ''
    });
  }
  next();
});

module.exports = mongoose.model('Bug', BugSchema);