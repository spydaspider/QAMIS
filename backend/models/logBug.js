const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub‑schema for each reproduction step
const ReproStepSchema = new Schema({
  stepNumber: { type: Number, required: true },     // 1, 2, 3…
  action:     { type: String, required: true, trim: true }  // “Click the Login button”
}, { _id: false });

const BugSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true                         // “Crash on invalid login”
  },
  description: {
    type: String,
    required: true,
    trim: true                         // Detailed bug explanation
  },
  reproductionSteps: {
    type: [ReproStepSchema],           // Array of steps
    required: true,
    validate: arr => Array.isArray(arr) && arr.length > 0
  },
  severity: {
    type: String,
    enum: ['low','medium','high','critical'],
    default: 'medium'
  },
  screenshots: [{
    type: String,                      // URLs or file paths
    trim: true
  }],
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true                     // Who logged the bug
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true                     // Which team to notify
  },
  status: {
    type: String,
    enum: ['open','in progress','resolved','closed'],
    default: 'open'
  }
}, { timestamps: true });