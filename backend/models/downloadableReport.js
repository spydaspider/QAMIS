// models/qaReport.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const QAReportSchema = new Schema({
  
  teamName: {
    type: String,
    required: true
  },
  experiment: {
    type: Schema.Types.ObjectId,
    ref: 'Experiment'
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },

  // Test suite metrics
  testsDesigned: {
    type: Number,
    default: 0,
    required: true
  },
  testsExecuted: {
    type: Number,
    default: 0,
    required: true
  },
  testCoverage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    required: true
  },
  passCount: {
    type: Number,
    default: 0,
    required: true
  },
  failCount: {
    type: Number,
    default: 0,
    required: true
  },
  passRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    required: true
  },

  // Defect metrics
  newDefects: {
    type: Number,
    default: 0,
    required: true
  },
  defectsClosed: {
    type: Number,
    default: 0,
    required: true
  },
  defectDensity: {
    type: Number,
    default: 0,
    required: true
  },

  // Severity breakdown
  severityCritical: {
    type: Number,
    default: 0
  },
  severityHigh: {
    type: Number,
    default: 0
  },
  severityMedium: {
    type: Number,
    default: 0
  },
  severityLow: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'generatedAt', updatedAt: false }
});

module.exports = mongoose.model('QAReport', QAReportSchema);
