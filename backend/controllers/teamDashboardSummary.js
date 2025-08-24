const Team = require('../models/teams');
const User = require('../models/user');
const Bug = require('../models/logBug');
const QAReport = require('../models/downloadableReport.js');
const TestCase = require('../models/testCase');
const { generateAndSaveQAReports } = require('../services/qAReportService');

const TeamDashboardSummary = async (req, res) => {
  try {
    const studentId = req.user?._id || req.params.studentId; // flexible source

    // find student and their team
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const team = await Team.findOne({ students: student._id });
    if (!team) {
      return res.status(404).json({ error: 'Team not found for this student' });
    }

    // always regenerate QAReports first
    await generateAndSaveQAReports();

    // run queries for this team only
    const [
      bugCountRes,
      testCasesCountRes,
      reportsRes
    ] = await Promise.allSettled([
      // FIX: use correct field name "team" not "teamId"
      Bug.countDocuments({ team: team._id }),  
      // if you only want *open* bugs instead of all, use:
      // Bug.countDocuments({ team: team._id, currentStatus: "open" }),

      TestCase.countDocuments({ assignedTeams: team._id }),
      QAReport.find({ teamName: team.name }).sort({ generatedAt: -1 }).limit(2)
    ]);

    const unwrap = (res, name, fallback = null) => {
      if (res.status === 'fulfilled') return res.value;
      console.error(`DB op failed: ${name}`, res.reason && (res.reason.stack || res.reason));
      return fallback;
    };

    const bugCount = unwrap(bugCountRes, 'Bug.countDocuments', 0);
    const testCasesCount = unwrap(testCasesCountRes, 'TestCase.countDocuments', 0);
    const reports = unwrap(reportsRes, 'QAReport.find', []);

    // summarize the reports
    const summary = reports.reduce((acc, doc) => {
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

    // build the response
    const teamDashboard = {
      team: {
        id: team._id,
        name: team.name,
        members: team.students
      },
      totals: {
        bugs: bugCount, // now correctly counts bugs for this team
        testsDesigned: testCasesCount,
        reportsConsidered: summary.count
      },
      qaMetrics: {
        testsExecuted: summary.testsExecuted,
        passRate: Number(passRate.toFixed(2)),
        avgTestCoverage: summary.count ? Number((summary.testCoverageSum / summary.count).toFixed(2)) : 0,
        openDefects: summary.openDefects,
        closedDefects: summary.closedDefects,
        severityCritical: summary.severityCritical,
        severityHigh: summary.severityHigh
      },
      alerts: []
    };

    // alerts
    if (teamDashboard.qaMetrics.passRate < 50) teamDashboard.alerts.push({ type: 'lowPassRate', value: teamDashboard.qaMetrics.passRate });
    if (teamDashboard.qaMetrics.openDefects > 5) teamDashboard.alerts.push({ type: 'highDefects', value: teamDashboard.qaMetrics.openDefects });
    if (teamDashboard.qaMetrics.avgTestCoverage < 40) teamDashboard.alerts.push({ type: 'lowCoverage', value: teamDashboard.qaMetrics.avgTestCoverage });
    if (teamDashboard.qaMetrics.severityCritical > 0) teamDashboard.alerts.push({ type: 'criticalSeverity', value: teamDashboard.qaMetrics.severityCritical });
    if (teamDashboard.qaMetrics.severityHigh > 0) teamDashboard.alerts.push({ type: 'highSeverity', value: teamDashboard.qaMetrics.severityHigh });

    res.json(teamDashboard);

  } catch (err) {
    console.error('Unexpected error in TeamDashboardSummary:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to fetch team dashboard summary', details: err && err.message });
  }
};

module.exports = TeamDashboardSummary;
