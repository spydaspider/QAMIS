const mongoose = require('mongoose');
const PerformanceMetrics = require('../models/performanceMetrics');

// Helper for standard errors
const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// 1. Record a new metrics snapshot
const createMetrics = async (req, res) => {
  const { team, bugCount, bugsResolvedCount, avgResolutionTime, testCasesExecuted, testPassRate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(team)) {
    return sendError(res, 400, 'Invalid team ID');
  }

  try {
    const metrics = new PerformanceMetrics({
      team,
      bugsLogged: bugCount,
      bugsResolvedCount,
      avgResolutionTimeHours: avgResolutionTime,
      testCasesExecuted,
      testPassRate
    });
    await metrics.save();
    res.status(201).json({ success: true, metrics });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// 2. Fetch the latest metrics for a given team
const getLatestMetrics = async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return sendError(res, 400, 'Invalid team ID');
  }

  try {
    const metrics = await PerformanceMetrics
      .findOne({ team: teamId })
      .sort({ recordedAt: -1 });
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
    if (to)   filter.recordedAt.$lte = new Date(to);
  }

  try {
    const history = await PerformanceMetrics
      .find(filter)
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

  // define the start of "today" in UTC
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  try {
    const metrics = await PerformanceMetrics.findOneAndUpdate(
      { team, recordedAt: { $gte: todayStart, $lt: todayEnd } },
      { team, bugsLogged: bugCount, bugsResolvedCount, avgResolutionTimeHours: avgResolutionTime, testCasesExecuted, testPassRate, recordedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, metrics });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

module.exports = { createMetrics, getLatestMetrics, getMetricsHistory, upsertTodayMetrics };