const mongoose = require('mongoose');
const { Schema } = mongoose;

const StepSchema = new Schema({
  stepNumber:   { type: Number, required: true },
  action:       { type: String, required: true, trim: true },
  expectedResult:{ type: String, required: true, trim: true }
}, { _id: false });

const ExecutionSchema = new Schema({
  team:        { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  executedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['pass','fail','blocked','not run'], default: 'not run' },
  actualResult:{ type: String, trim: true },
  comments:    { type: String, trim: true, default: '' },
  executedAt:  { type: Date, default: Date.now }
}, { _id: false });

const TestCaseSchema = new Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, trim: true },
  steps:         { type: [StepSchema], required: true, validate: arr => Array.isArray(arr) && arr.length > 0 },
  author:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  executions:    { type: [ExecutionSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('TestCase', TestCaseSchema);