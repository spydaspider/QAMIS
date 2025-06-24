const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  experiment: {
    type: Types.ObjectId,
    ref: 'Experiment',
    required: true
  },
  students: [
    {
      type: Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

module.exports = model('Team', TeamSchema);
