const mongoose = require('mongoose');
const PerformanceMetrics = require('../models/performanceMetrics');
const Bug = require('../models/logBug');
const TestCase = require('../models/testCase');

// Helper for standard errors
const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// 1. Record a new metrics snapshot (auto-computed)
const createMetrics = async (req, res) => {
  const { team } = req.body;
  if (!mongoose.Types.ObjectId.isValid(team)) {
    return res.status(400).json({ success: false, message: 'Invalid team ID' });
  }

  try {
    const teamObjectId = new mongoose.Types.ObjectId(team);

    // 1. Total bugs logged
    const bugsLogged = await Bug.countDocuments({ team: teamObjectId });

    // 2. Bugs resolved
    const bugsResolvedCount = await Bug.countDocuments({
      team: teamObjectId,
      currentStatus: 'closed'
    });

    // 3. Avg resolution time (hours)
    const [{ avg: avgResolutionTimeHours = 0 } = {}] =
      await Bug.aggregate([
        { $match: { team: teamObjectId, currentStatus: 'closed' } },
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

    // 4. Test executions & pass rate
    const execStats = await TestCase.aggregate([
      { $unwind: '$executions' },
      { $match: { 'executions.team': teamObjectId } },
      {
        $group: {
          _id: '$executions.status',
          count: { $sum: 1 }
        }
      }
    ]);

    let testCasesExecuted = 0,
      passCount = 0;
    execStats.forEach((s) => {
      testCasesExecuted += s.count;
      if (s._id === 'pass') passCount = s.count;
    });
    const testPassRate = testCasesExecuted
      ? passCount / testCasesExecuted
      : 0;

    // 5. Save the snapshot
    const metrics = new PerformanceMetrics({
      team,
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
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Fetch the latest metrics for a given team
const getLatestMetrics = async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return sendError(res, 400, 'Invalid team ID');
  }

  try {
    const metrics = await PerformanceMetrics.findOne({ team: teamId }).sort({ recordedAt: -1 });
    if (!metrics) return sendError(res, 404, 'No metrics found for this team');
    res.json({ success: true, metrics });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// 3. Fetch a history of metrics for a team (optionally within a date range)
const getMetricsHistory = async (req, res) => {
  const { teamId } = req.params;
  const { from, to, limit = 50 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return sendError(res, 400, 'Invalid team ID');
  }

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
    res.json({ success: true, history });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// 4. Upsert (create or update) today's metrics snapshot for a team
const upsertTodayMetrics = async (req, res) => {
  const { team, bugCount, bugsResolvedCount, avgResolutionTime, testCasesExecuted, testPassRate } = req.body;
  if (!mongoose.Types.ObjectId.isValid(team)) {
    return sendError(res, 400, 'Invalid team ID');
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  try {
    const metrics = await PerformanceMetrics.findOneAndUpdate(
      { team, recordedAt: { $gte: todayStart, $lt: todayEnd } },
      {
        team,
        bugsLogged: bugCount,
        bugsResolvedCount,
        avgResolutionTimeHours: avgResolutionTime,
        testCasesExecuted,
        testPassRate,
        recordedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, metrics });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

module.exports = {
  createMetrics,
  getLatestMetrics,
  getMetricsHistory,
  upsertTodayMetrics
};
