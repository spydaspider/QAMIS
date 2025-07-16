const mongoose = require('mongoose');
const { Schema } = mongoose;

// A Sprint or period for which code size and defect metrics are recorded
const SprintSchema = new Schema({
  team:         { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  name:         { type: String, required: true, trim: true },
  periodStart:  { type: Date, required: true },
  periodEnd:    { type: Date, required: true },
  codeSizeKloc: { type: Number, required: true }, // total LOC in thousands
}, { timestamps: true });

module.exports = mongoose.model('Sprint', SprintSchema);