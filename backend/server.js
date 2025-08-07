const express = require('express');
const mongoose = require('mongoose');
const experiments = require('./routes/experiments.js');
const teams = require('./routes/teams.js');
const users = require('./routes/users.js');
const testCases = require('./routes/testCase.js');
const logBug = require('./routes/logBug.js');
const discussionThread = require('./routes/discussionThread.js');
const performanceMetrics = require('./routes/performanceMetrics.js');
const sprints = require('./routes/sprint.js');
const report = require('./routes/downloadableReport.js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req,res, next)=>{
    console.log(req.path, req.body);
    next();
})
app.get('/', (req, res) => {
    res.send('Quality assurance backend is running!');
  });
const PORT = process.env.PORT || 5000
app.use('/api/users', users);
app.use('/api/experiments', experiments);
app.use('/api/teams', teams);
app.use('/api/testCases', testCases);
app.use('/api/logBug',logBug);
app.use('/api/discussionThread', discussionThread);
app.use('/api/teams/:teamId/metrics', performanceMetrics);
app.use('/api/sprints', sprints);
app.use('/api/report', report);
 mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(PORT,()=>{    
        console.log("connected to the mongoose server on ", PORT);
    })
}).catch((error)=>{
    console.error(error.message);
})