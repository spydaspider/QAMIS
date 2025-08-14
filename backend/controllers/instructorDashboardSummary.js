const Team = require('../models/teams');
const User = require('../models/user');
const Experiment = require('../models/experiments');
const Bug = require('../models/logBug');
const QAReport = require('../models/downloadableReport.js');

const InstructorDashboardSummary = async (req, res) => {
  try {
    // run DB ops concurrently
    const [
      teamCountRes,
      userCountRes,
      experimentCountRes,
      bugCountRes,
      perTeamLatestTwoRes,
      recentBugsRes,
      recentExperimentsRes
    ] = await Promise.allSettled([
      Team.countDocuments(),
      User.countDocuments(),
      Experiment.countDocuments(),
      Bug.countDocuments(),

      // aggregate: sort newest-first, group by teamName and take first 2
      QAReport.aggregate([
        { $sort: { generatedAt: -1 } },
        { $group: { _id: "$teamName", reports: { $push: "$$ROOT" } } },
        { $project: { teamName: "$_id", reports: { $slice: ["$reports", 2] } } }
      ]),

      // explicitly populate team with model + teamName
      Bug.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate({ path: 'team', model: 'Team', select: 'teamName' }),

      Experiment.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate({ path: 'team', model: 'Team', select: 'teamName' })
    ]);

    const unwrap = (res, name, fallback = null) => {
      if (res.status === 'fulfilled') return res.value;
      console.error(`DB op failed: ${name}`, res.reason && (res.reason.stack || res.reason));
      return fallback;
    };

    const teamCount = unwrap(teamCountRes, 'Team.countDocuments', 0);
    const userCount = unwrap(userCountRes, 'User.countDocuments', 0);
    const experimentCount = unwrap(experimentCountRes, 'Experiment.countDocuments', 0);
    const bugCount = unwrap(bugCountRes, 'Bug.countDocuments', 0);
    const perTeamLatestTwo = unwrap(perTeamLatestTwoRes, 'QAReport.aggregate(perTeamLatestTwo)', []);
    const recentBugs = unwrap(recentBugsRes, 'Bug.find (recent)', []);
    const recentExperiments = unwrap(recentExperimentsRes, 'Experiment.find (recent)', []);

    // Flatten all the picked reports
    const combinedReports = (perTeamLatestTwo || []).flatMap(p =>
      (p.reports || []).map(r => ({
        ...r,
        teamName: p.teamName || r.teamName || 'Unknown'
      }))
    );

    // Build per-team aggregated snapshot (based on up-to-2-latest reports)
    const perTeamSummaries = {};
    for (const p of (perTeamLatestTwo || [])) {
      const teamName = p.teamName || 'Unknown';
      const reports = p.reports || [];

      const summary = reports.reduce((acc, doc) => {
        acc.testsDesigned += (doc.testsDesigned ?? 0);
        acc.testsExecuted += (doc.testsExecuted ?? 0);
        acc.openDefects += (doc.newDefects ?? 0);
        acc.closedDefects += (doc.defectsClosed ?? doc.closedDefects ?? 0);
        acc.passRateWeightedNumerator += ((doc.passRate ?? 0) * (doc.testsExecuted ?? 0));
        acc.passRateWeightDenom += (doc.testsExecuted ?? 0);
        acc.testCoverageSum += (doc.testCoverage ?? 0);
        acc.severityCritical += (doc.severityCritical ?? 0);
        acc.severityHigh += (doc.severityHigh ?? 0);
        acc.count += 1;
        return acc;
      }, {
        testsDesigned: 0, testsExecuted: 0, openDefects: 0, closedDefects: 0,
        passRateWeightedNumerator: 0, passRateWeightDenom: 0, testCoverageSum: 0,
        severityCritical: 0, severityHigh: 0, count: 0
      });

      const passRate = summary.passRateWeightDenom > 0
        ? (summary.passRateWeightedNumerator / summary.passRateWeightDenom)
        : (summary.count ? (summary.testCoverageSum / summary.count) : 0);

      perTeamSummaries[teamName] = {
        teamName,
        reportsCount: summary.count,
        testsDesigned: summary.testsDesigned,
        testsExecuted: summary.testsExecuted,
        openDefects: summary.openDefects,
        closedDefects: summary.closedDefects,
        passRate: Number(passRate.toFixed(2)),
        avgTestCoverage: summary.count ? Number((summary.testCoverageSum / summary.count).toFixed(2)) : 0,
        severityCritical: summary.severityCritical,
        severityHigh: summary.severityHigh
      };
    }

    // Build overall (across all teams' two latest reports)
    const overall = combinedReports.reduce((acc, doc) => {
      acc.testsDesigned += (doc.testsDesigned ?? 0);
      acc.testsExecuted += (doc.testsExecuted ?? 0);
      acc.openDefects += (doc.newDefects ?? 0);
      acc.closedDefects += (doc.defectsClosed ?? doc.closedDefects ?? 0);
      acc.passRateWeightedNumerator += ((doc.passRate ?? 0) * (doc.testsExecuted ?? 0));
      acc.passRateWeightDenom += (doc.testsExecuted ?? 0);
      acc.testCoverageSum += (doc.testCoverage ?? 0);
      acc.count += 1;
      return acc;
    }, { testsDesigned: 0, testsExecuted: 0, openDefects: 0, closedDefects: 0, passRateWeightedNumerator: 0, passRateWeightDenom: 0, testCoverageSum: 0, count: 0 });

    const overallPassRate = overall.passRateWeightDenom > 0
      ? (overall.passRateWeightedNumerator / overall.passRateWeightDenom)
      : (overall.count ? (overall.testCoverageSum / overall.count) : 0);

    const qaMetrics = {
      reportsConsidered: overall.count,
      testsDesigned: overall.testsDesigned,
      testsExecuted: overall.testsExecuted,
      passRate: Number((overallPassRate || 0).toFixed(2)),
      testCoverage: overall.count ? Number((overall.testCoverageSum / overall.count).toFixed(2)) : 0,
      openDefects: overall.openDefects,
      closedDefects: overall.closedDefects
    };

    // recent activity (merge bugs + experiments sorted by createdAt)
    const recentActivity = [
      ...recentBugs.map(b => ({
        type: 'bug',
        title: b.title || 'Untitled bug',
        team: typeof b.team === 'object' && b.team?.teamName
          ? b.team.teamName
          : (b.team?.toString?.() || 'Unknown'),
        createdAt: b.createdAt || b._id?.getTimestamp?.() || null
      })),
      ...recentExperiments.map(e => ({
        type: 'experiment',
        title: e.title || 'Untitled experiment',
        team: typeof e.team === 'object' && e.team?.teamName
          ? e.team.teamName
          : (e.team?.toString?.() || 'Unknown'),
        createdAt: e.createdAt || e._id?.getTimestamp?.() || null
      }))
    ]
      .filter(x => x.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Build alerts
    const alerts = [];
    for (const [team, summary] of Object.entries(perTeamSummaries)) {
      if (summary.passRate < 50) alerts.push({ type: 'lowPassRate', team, value: summary.passRate });
      if (summary.openDefects > 5) alerts.push({ type: 'highDefects', team, value: summary.openDefects });
      if (summary.avgTestCoverage < 40) alerts.push({ type: 'lowCoverage', team, value: summary.avgTestCoverage });
      if (summary.severityCritical > 0) alerts.push({ type: 'criticalSeverity', team, value: summary.severityCritical });
      if (summary.severityHigh > 0) alerts.push({ type: 'highSeverity', team, value: summary.severityHigh });
    }

    res.json({
      totals: {
        teams: teamCount,
        users: userCount,
        experiments: experimentCount,
        bugs: bugCount
      },
      qaMetrics,
      perTeamSummaries,
      recentActivity,
      alerts
    });
  } catch (err) {
    console.error('Unexpected error in InstructorDashboardSummary:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to fetch dashboard summary', details: err && err.message });
  }
};

module.exports = InstructorDashboardSummary;
