const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const Team = require('../models/teams');
const Bug = require('../models/logBug');
const TestCase = require('../models/testCase');
const Experiment = require('../models/experiments');
const QAReport = require('../models/downloadableReport.js');
const User = require('../models/user');
const PerformanceMetrics = require('../models/performanceMetrics');

const generateGeneralQAReport = async (req, res) => {
  try {
    const teams = await Team.find().populate('experiment');
    const report = [];
    const processedTeamNames = [];

    for (const team of teams) {
      const teamId = team._id;
      const teamName = team.name;
      processedTeamNames.push(teamName);
      const experiment = team.experiment;

      // 1. Get defectDensity from latest metrics
      let latestMetrics = await PerformanceMetrics
        .findOne({ team: teamId })
        .sort({ generatedAt: -1 });

      const defectDensity = latestMetrics?.defectDensity || 0;

      // 2. Get users in this team
      const users = await User.find({ _id: { $in: team.students } });
      const userIds = users.map(u => u._id);

      // 3. Get all bugs reported by this team's users
      const bugs = await Bug.find({ reporter: { $in: userIds } });
      const defectsClosed = bugs.filter(b => ['closed', 'resolved'].includes(b.currentStatus)).length;

      const severityCount = { critical: 0, high: 0, medium: 0, low: 0 };
      bugs.forEach(bug => {
        if (bug && bug.severity && severityCount.hasOwnProperty(bug.severity)) {
          severityCount[bug.severity]++;
        }
      });

      // 4. Calculate test case stats
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
      const passRate = testsExecuted ? (passCount / testsExecuted) * 100 : 0;

      // 5. Capped test coverage (as number)
      let testCoverage = testsDesigned ? (testsExecuted / testsDesigned) * 100 : 0;
      testCoverage = Math.min(testCoverage, 100);
      testCoverage = Number(testCoverage.toFixed(2));
      const passRateNum = Number(passRate.toFixed(2));

      // 6. Save testCoverage back into latest performance metrics
      if (latestMetrics) {
        latestMetrics.testCoverage = testCoverage;
        await latestMetrics.save();
      } else {
        latestMetrics = new PerformanceMetrics({
          team: teamId,
          testCoverage,
          defectDensity
        });
        await latestMetrics.save();
      }

      // 7. Build report data for DB (store numbers, dates as Date objects)
      const reportData = {
        teamName: teamName,
        periodStart: experiment?.startDate || new Date('2000-01-01'),
        periodEnd: experiment?.endDate || new Date(),
        testsDesigned,
        testsExecuted,
        testCoverage,              // number
        passCount,
        failCount,
        passRate: passRateNum,     // number
        newDefects: bugs.length,
        defectsClosed,
        defectDensity,
        severityCritical: severityCount.critical,
        severityHigh: severityCount.high,
        severityMedium: severityCount.medium,
        severityLow: severityCount.low,
        generatedAt: new Date()
      };

      // Upsert: overwrite existing report for this team or create if missing
      await QAReport.updateOne(
        { teamName: teamName },
        { $set: reportData },
        { upsert: true }
      );

      // 8. Format dates for CSV only (strings)
      const { periodStart, periodEnd, ...rest } = reportData;
      report.push({
        teamName,
        experimentName: experiment?.title || 'Unknown',
        periodStart: periodStart.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        periodEnd: periodEnd.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        ...rest
      });
    }

    // 9. Remove any QAReport documents not in processedTeamNames
    // This ensures the collection only contains reports for the teams processed (i.e., only those two documents).
    await QAReport.deleteMany({ teamName: { $nin: processedTeamNames } });

    // 10. CSV fields (no team ID, no experiment ID)
    const fields = [
      'teamName', 'experimentName', 'periodStart', 'periodEnd',
      'testsDesigned', 'testsExecuted', 'testCoverage',
      'passCount', 'failCount', 'passRate',
      'newDefects', 'defectsClosed', 'defectDensity',
      'severityCritical', 'severityHigh', 'severityMedium', 'severityLow'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(report);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=general_report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = generateGeneralQAReport;
