// Controller: generateGeneralQAReport
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const Team = require('../models/teams');
const Bug = require('../models/logBug');
const TestCase = require('../models/testCase');
const Experiment = require('../models/experiments');
const QAReport = require('../models/downloadableReport.js');
const User = require('../models/user');

const generateGeneralQAReport = async (req, res) => {
  try {
    const teams = await Team.find().populate('experiment');
    const report = [];

    for (const team of teams) {
      const teamId = team._id;
      const experiment = team.experiment;

      // Get users in this team
      const users = await User.find({ _id: { $in: team.students } });
      const userIds = users.map(u => u._id);

      // Get all bugs reported by this team's users (no date filtering)
      const bugs = await Bug.find({ reporter: { $in: userIds } });
      const defectsClosed = bugs.filter(b => ['closed', 'resolved'].includes(b.currentStatus)).length;

      const severityCount = { critical: 0, high: 0, medium: 0, low: 0 };
      bugs.forEach(bug => {
        severityCount[bug.severity]++;
      });

      // Test cases assigned to this team via assignedTeams
      const testCases = await TestCase.find({ 'assignedTeams._id': teamId });
      const testsDesigned = testCases.length;

      // Count executions where execution.team matches this team
      const execStats = await TestCase.aggregate([
        { $unwind: '$executions' },
        { $match: { 'executions.team._id': teamId } },
        { $group: { _id: '$executions.status', count: { $sum: 1 } } }
      ]);

      let passCount = 0, failCount = 0;
      execStats.forEach(stat => {
        if (stat._id === 'pass') passCount = stat.count;
        if (stat._id === 'fail') failCount = stat.count;
      });

      const testsExecuted = passCount + failCount;
      const passRate = testsExecuted ? (passCount / testsExecuted) * 100 : 0;

      const reportData = {
        team: teamId,
        teamName: team.name,
        experiment: experiment?._id || null,
        periodStart: experiment?.startDate || new Date('2000-01-01'),
        periodEnd: experiment?.endDate || new Date(),
        testsDesigned,
        testsExecuted,
        testCoverage: 0,
        passCount,
        failCount,
        passRate: passRate.toFixed(2),
        newDefects: bugs.length,
        defectsClosed,
        defectDensity: testsExecuted ? (bugs.length / testsExecuted) * 1000 : 0,
        severityCritical: severityCount.critical,
        severityHigh: severityCount.high,
        severityMedium: severityCount.medium,
        severityLow: severityCount.low
      };

      await QAReport.create(reportData);

      report.push({
        experimentName: experiment?.title || 'Unknown',
        periodStart: reportData.periodStart.toISOString().slice(0, 10),
        periodEnd: reportData.periodEnd.toISOString().slice(0, 10),
        ...reportData
      });
    }

    const fields = [
      'team', 'teamName', 'experimentName', 'periodStart', 'periodEnd',
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