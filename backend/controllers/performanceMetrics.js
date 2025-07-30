const mongoose = require('mongoose');
const cron = require('node-cron');
const PerformanceMetrics = require('../models/performanceMetrics');
const Team = require('../models/teams');
const Bug = require('../models/logBug');
const TestCase = require('../models/testCase');

// Helper for standard errors
const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// 1. Record a new metrics snapshot for a team
//    POST /api/teams/:teamId/metrics
const createMetrics = async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return sendError(res, 400, 'Invalid team ID');
  }

  try {
    const teamObjectId = new mongoose.Types.ObjectId(teamId);
    
    // Total bugs logged
    const bugsLogged = await Bug.countDocuments({ team: teamObjectId });

    // Bugs resolved: count both “closed” and “resolved”
    const resolvedStatuses = ['closed', 'resolved'];
    const bugsResolvedCount = await Bug.countDocuments({
      team: teamObjectId,
      currentStatus: { $in: resolvedStatuses }
    });

    // Avg resolution time (hours) across all resolved bugs
    const [{ avg: avgResolutionTimeHours = 0 } = {}] = await Bug.aggregate([
      {
        $match: {
          team: teamObjectId,
          currentStatus: { $in: resolvedStatuses },
          createdAt: { $exists: true },
          updatedAt: { $exists: true }
        }
      },
      {
        $project: {
          dtHours: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }
      },
      { $group: { _id: null, avg: { $avg: '$dtHours' } } }
    ]);

    // Test executions & pass rate
    const execStats = await TestCase.aggregate([
      { $unwind: '$executions' },
      { $match: { 'executions.team': teamObjectId } },
      { $group: { _id: '$executions.status', count: { $sum: 1 } } }
    ]);
    let testCasesExecuted = 0, passCount = 0;
    execStats.forEach(s => {
      testCasesExecuted += s.count;
      if (s._id === 'pass') passCount = s.count;
    });
    const testPassRate = testCasesExecuted ? passCount / testCasesExecuted : 0;

    // Create and save, defectDensity computed in pre-save hook
    const metrics = new PerformanceMetrics({
      team: teamId,
      bugsLogged,
      bugsResolvedCount,
      avgResolutionTimeHours,
      testCasesExecuted,
      testPassRate
    });
    await metrics.save();

    return res.status(201).json({ success: true, metrics });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, err.message);
  }
};

// 2. Fetch the latest metrics for a team
//    GET /api/teams/:teamId/metrics/latest
const getLatestMetrics = async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) return sendError(res, 400, 'Invalid team ID');
  try {
    const metrics = await PerformanceMetrics.findOne({ team: teamId }).sort({ recordedAt: -1 });
    if (!metrics) return sendError(res, 404, 'No metrics found');
    return res.json({ success: true, metrics });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// 3. Fetch metrics history
//    GET /api/teams/:teamId/metrics?from=...&to=...&limit=...
const getMetricsHistory = async (req, res) => {
  const { teamId } = req.params;
  const { from, to, limit = 50 } = req.query;
  if (!mongoose.Types.ObjectId.isValid(teamId)) return sendError(res, 400, 'Invalid team ID');

  const filter = { team: teamId };
  if (from || to) {
    filter.recordedAt = {};
    if (from) filter.recordedAt.$gte = new Date(from);
    if (to) filter.recordedAt.$lte = new Date(to);
  }

  try {
    const history = await PerformanceMetrics.find(filter)
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit, 10));
    return res.json({ success: true, history });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// 4. Upsert today’s snapshot
//    PUT /api/teams/:teamId/metrics
const upsertTodayMetrics = async (req, res) => {
  const { teamId } = req.params;
  let { bugCount, bugsResolvedCount, avgResolutionTime, testCasesExecuted, testPassRate } = req.body;
  if (!mongoose.Types.ObjectId.isValid(teamId)) return sendError(res, 400, 'Invalid team ID');

  const todayStart = new Date();
  todayStart.setUTCHours(0,0,0,0);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  // compute defectDensity manually since update bypasses hooks
  const defectDensity = testCasesExecuted ? (bugCount / testCasesExecuted) * 1000 : 0;

  try {
    const metrics = await PerformanceMetrics.findOneAndUpdate(
      { team: teamId, recordedAt: { $gte: todayStart, $lt: todayEnd } },
      {
        team: teamId,
        bugsLogged: bugCount,
        bugsResolvedCount,
        avgResolutionTimeHours: avgResolutionTime,
        testCasesExecuted,
        testPassRate,
        defectDensity,
        recordedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, metrics });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// 5. Nightly snapshot
cron.schedule('0 0 * * *', async () => {
  try {
    const teams = await Team.find({}, '_id');
    for (const { _id } of teams) {
      await createMetrics(
        { params: { teamId: _id.toString() } },
        { status: () => ({ json: () => {} }) }
      );
    }
    console.log('Nightly metrics done');
  } catch (error) {
    console.error('Nightly metrics error', error);
  }
});

module.exports = {
  createMetrics,
  getLatestMetrics,
  getMetricsHistory,
  upsertTodayMetrics
};
