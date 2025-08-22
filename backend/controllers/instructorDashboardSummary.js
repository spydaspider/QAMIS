const Team = require('../models/teams');
const User = require('../models/user');
const Experiment = require('../models/experiments');
const Bug = require('../models/logBug');
const QAReport = require('../models/downloadableReport.js');
const TestCase = require('../models/testCase'); // <-- add testCases model
const { generateAndSaveQAReports } = require('../services/qAReportService'); // <- shared generator

const InstructorDashboardSummary = async (req, res) => {
  try {
    //always regenerate QAReports first
    await generateAndSaveQAReports();

    // run DB ops concurrently
    const [
      teamCountRes,
      userCountRes,
      experimentCountRes,
      bugCountRes,
      testCasesCountRes, // <-- new
      perTeamLatestTwoRes
    ] = await Promise.allSettled([
      Team.countDocuments(),
      User.countDocuments(),
      Experiment.countDocuments(),
      Bug.countDocuments(),
      TestCase.countDocuments(), // <-- count test cases

      // aggregate: sort newest-first, group by teamName and take first 2
      QAReport.aggregate([
        { $sort: { generatedAt: -1 } },
        { $group: { _id: "$teamName", reports: { $push: "$$ROOT" } } },
        { $project: { teamName: "$_id", reports: { $slice: ["$reports", 2] } } }
      ])
    ]);

    // unwrap helper
    const unwrap = (res, name, fallback = null) => {
      if (res.status === 'fulfilled') return res.value;
      console.error(`DB op failed: ${name}`, res.reason && (res.reason.stack || res.reason));
      return fallback;
    };

    const teamCount = unwrap(teamCountRes, 'Team.countDocuments', 0);
    const userCount = unwrap(userCountRes, 'User.countDocuments', 0);
    const experimentCount = unwrap(experimentCountRes, 'Experiment.countDocuments', 0);
    const bugCount = unwrap(bugCountRes, 'Bug.countDocuments', 0);
    const testCasesCount = unwrap(testCasesCountRes, 'TestCase.countDocuments', 0); // <-- unwrap
    const perTeamLatestTwo = unwrap(perTeamLatestTwoRes, 'QAReport.aggregate(perTeamLatestTwo)', []);

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
        // acc.testsDesigned += (doc.testsDesigned ?? 0); // <-- remove this line
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
        testsExecuted: 0, openDefects: 0, closedDefects: 0,
        passRateWeightedNumerator: 0, passRateWeightDenom: 0, testCoverageSum: 0,
        severityCritical: 0, severityHigh: 0, count: 0
      });

      const passRate = summary.passRateWeightDenom > 0
        ? (summary.passRateWeightedNumerator / summary.passRateWeightDenom)
        : (summary.count ? (summary.testCoverageSum / summary.count) : 0);

      perTeamSummaries[teamName] = {
        teamName,
        reportsCount: summary.count,
        testsDesigned: testCasesCount, // <-- use testCases count
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
      // acc.testsDesigned += (doc.testsDesigned ?? 0); // <-- remove this line
      acc.testsExecuted += (doc.testsExecuted ?? 0);
      acc.openDefects += (doc.newDefects ?? 0);
      acc.closedDefects += (doc.defectsClosed ?? doc.closedDefects ?? 0);
      acc.passRateWeightedNumerator += ((doc.passRate ?? 0) * (doc.testsExecuted ?? 0));
      acc.passRateWeightDenom += (doc.testsExecuted ?? 0);
      acc.testCoverageSum += (doc.testCoverage ?? 0);
      acc.count += 1;
      return acc;
    }, { testsExecuted: 0, openDefects: 0, closedDefects: 0, passRateWeightedNumerator: 0, passRateWeightDenom: 0, testCoverageSum: 0, count: 0 });

    const overallPassRate = overall.passRateWeightDenom > 0
      ? (overall.passRateWeightedNumerator / overall.passRateWeightDenom)
      : (overall.count ? (overall.testCoverageSum / overall.count) : 0);

    const qaMetrics = {
      reportsConsidered: overall.count,
      testsDesigned: testCasesCount, // <-- use testCases count
      testsExecuted: overall.testsExecuted,
      passRate: Number((overallPassRate || 0).toFixed(2)),
      testCoverage: overall.count ? Number((overall.testCoverageSum / overall.count).toFixed(2)) : 0,
      openDefects: overall.openDefects,
      closedDefects: overall.closedDefects
    };

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
      alerts
    });
  } catch (err) {
    console.error('Unexpected error in InstructorDashboardSummary:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to fetch dashboard summary', details: err && err.message });
  }
};

module.exports = InstructorDashboardSummary;
