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
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "performanceMetrics" }
);

PerformanceMetricsSchema.index({ team: 1, recordedAt: -1 });

module.exports = mongoose.model("PerformanceMetrics", PerformanceMetricsSchema);
