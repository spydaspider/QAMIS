const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const ExperimentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  methodology: {
    type: String,
    enum: ['Waterfall Methodology', 'Agile Methodology'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  teams: [
    {
      type: Types.ObjectId,
      ref: 'Team'
    }
  ]
}, {
  timestamps: true
});

module.exports = model('Experiment', ExperimentSchema);