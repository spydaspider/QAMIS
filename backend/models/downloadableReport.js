const mongoose = require('mongoose');
const { Schema } = mongoose;

const DownloadableReportSchema = new Schema({
  // Which team or cohort this report covers
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  // Reporting period
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  // Metrics
  defectDensity: {
    type: Number,   // defects per 100 test cases
    required: true
  },
  testCoverage: {
    type: Number,   // percentage (0-100)
    min: 0,
    max: 100,
    required: true
  },
  averageResolutionTime: {
    type: Number,   // hours (float)
    required: true
  },
  // Report metadata
  reportFormat: {
    type: String,
    enum: ['csv', 'pdf'],
    default: 'csv',
    required: true
  },
  reportFile: {
    type: Buffer,    // raw file bytes
    required: true
  },
  contentType: {
    type: String,    // e.g., 'text/csv' or 'application/pdf'
    required: true
  }
}, {
  timestamps: { createdAt: 'generatedAt' }
});

module.exports = mongoose.model('DownloadableReport', DownloadableReportSchema);
