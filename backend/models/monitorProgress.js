const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProgressReportSchema = new Schema({
  // Which team this report is for
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },

  // Period covered by this report (e.g. daily, weekly)
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },

  // Number of currently open/active bugs
  activeBugsCount: {
    type: Number,
    default: 0
  },

  // Total test case executions in this period
  testExecutionsCount: {
    type: Number,
    default: 0
  },

  // Of those executions, how many passed vs. failed
  passedExecutionsCount: {
    type: Number,
    default: 0
  },
  failedExecutionsCount: {
    type: Number,
    default: 0
  },

  // Defect metrics
  newDefectsCount: {
    type: Number,
    default: 0
  },
  defectResolutionCount: {
    type: Number,
    default: 0
  },

  // Computed rates (optional—could also compute on the fly)
  passRate: {
    type: Number,    // e.g. 0.85 for 85%
    min: 0,
    max: 1
  },
  defectDensity: {
    type: Number,    // e.g. defects per test case or per KLOC
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProgressReport', ProgressReportSchema);
