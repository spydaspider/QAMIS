const mongoose = require("mongoose");
const { Schema } = mongoose;

const PerformanceMetricsSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    bugsLogged: { type: Number, default: 0 },
    bugsResolvedCount: { type: Number, default: 0 },
    avgResolutionTimeHours: { type: Number, default: 0 },
    testCasesExecuted: { type: Number, default: 0 },
    testPassRate: { type: Number, default: 0 },
    // Defect density: bugs per 1000 test cases executed
    defectDensity: { type: Number, default: 0 },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "performanceMetrics" }
);

// Compound index for fast retrieval
PerformanceMetricsSchema.index({ team: 1, recordedAt: -1 });

// Pre-save hook to calculate defect density (bugs per 1000 test executions)
PerformanceMetricsSchema.pre('save', function(next) {
  if (this.testCasesExecuted > 0) {
    this.defectDensity = (this.bugsLogged / this.testCasesExecuted) * 1000;
  } else {
    this.defectDensity = 0;
  }
  next();
});

module.exports = mongoose.model("PerformanceMetrics", PerformanceMetricsSchema);
