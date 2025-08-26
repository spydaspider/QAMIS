// services/qaReportService.js
const Team = require('../models/teams');
const Bug = require('../models/logBug');
const TestCase = require('../models/testCase');
const Experiment = require('../models/experiments');
const QAReport = require('../models/downloadableReport');
const User = require('../models/user');
const PerformanceMetrics = require('../models/performanceMetrics');

async function generateAndSaveQAReports() {
  const teams = await Team.find().populate('experiment');
  const processedTeamNames = [];

  for (const team of teams) {
    const teamId = team._id;
    const teamName = team.name;
    processedTeamNames.push(teamName);
    const experiment = team.experiment;

    const users = await User.find({ _id: { $in: team.students } });
    const userIds = users.map(u => u._id);

    const bugs = await Bug.find({ reporter: { $in: userIds } });
    const newDefects = bugs.length;
    const defectsClosed = bugs.filter(b => ['closed', 'resolved'].includes(b.currentStatus)).length;

    const severityCount = { critical: 0, high: 0, medium: 0, low: 0 };
    bugs.forEach(bug => {
      if (bug && bug.severity && severityCount.hasOwnProperty(bug.severity)) {
        severityCount[bug.severity]++;
      }
    });

    const testsDesigned = await TestCase.countDocuments({ assignedTeams: teamId });

    const execStats = await TestCase.aggregate([
      { $unwind: '$executions' },
      { $match: { 'executions.team': teamId } },
      { $group: { _id: '$executions.status', count: { $sum: 1 } } }
    ]);

    let passCount = 0, failCount = 0;
    execStats.forEach(stat => {
      if (stat._id === 'pass') passCount = stat.count;
      if (stat._id === 'fail') failCount = stat.count;
    });

    const testsExecuted = passCount + failCount;

    // --- ✅ Defect density per 1000 test cases ---
    const defectDensity = testsExecuted > 0
      ? (newDefects / testsExecuted) * 1000
      : 0;

    const passRate = testsExecuted ? (passCount / testsExecuted) * 100 : 0;
    let testCoverage = testsDesigned ? (testsExecuted / testsDesigned) * 100 : 0;
    testCoverage = Math.min(testCoverage, 100);
    testCoverage = Number(testCoverage.toFixed(2));
    const passRateNum = Number(passRate.toFixed(2));

    // --- update or create performance metrics ---
    let latestMetrics = await PerformanceMetrics
      .findOne({ team: teamId })
      .sort({ generatedAt: -1 });

    if (latestMetrics) {
      latestMetrics.testCoverage = testCoverage;
      latestMetrics.defectDensity = defectDensity; // per 1000
      await latestMetrics.save();
    } else {
      latestMetrics = new PerformanceMetrics({ team: teamId, testCoverage, defectDensity });
      await latestMetrics.save();
    }

    const reportData = {
      teamName,
      periodStart: experiment?.startDate || new Date('2000-01-01'),
      periodEnd: experiment?.endDate || new Date(),
      testsDesigned,
      testsExecuted,
      testCoverage,
      passCount,
      failCount,
      passRate: passRateNum,
      newDefects,
      defectsClosed,
      defectDensity,   // per 1000 test cases
      severityCritical: severityCount.critical,
      severityHigh: severityCount.high,
      severityMedium: severityCount.medium,
      severityLow: severityCount.low,
      generatedAt: new Date()
    };

    await QAReport.updateOne(
      { teamName },
      { $set: reportData },
      { upsert: true }
    );
  }

  await QAReport.deleteMany({ teamName: { $nin: processedTeamNames } });
}

module.exports = { generateAndSaveQAReports };
