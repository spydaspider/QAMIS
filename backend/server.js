const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Models

// Existing routes...
const experiments = require("./routes/experiments.js");
const teams = require("./routes/teams.js");
const users = require("./routes/users.js");
const testCases = require("./routes/testCase.js");
const logBug = require("./routes/logBug.js");
const discussionThread = require("./routes/discussionThread.js");
const performanceMetrics = require("./routes/performanceMetrics.js");
const sprints = require("./routes/sprint.js");
const report = require("./routes/downloadableReport.js");
const dashboardSummary = require("./routes/instructorDashboardSummary.js");
const studentDashboard = require("./routes/teamDashboardSummary.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => { console.log(req.path, req.body); next(); });

app.get("/", (_req, res) => {
  res.send("QA backend running with global + threaded chat");
});

app.use("/api/users", users);
app.use("/api/experiments", experiments);
app.use("/api/teams", teams);
app.use("/api/testCases", testCases);
app.use("/api/logBug", logBug);
app.use("/api/discussionThread", discussionThread);
app.use("/api/teams/:teamId/metrics", performanceMetrics);
app.use("/api/sprints", sprints);
app.use("/api/report", report);
app.use("/api/dashboard", dashboardSummary);
app.use("/api/studentDashboard", studentDashboard);



const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => console.log("Server up on", PORT));
}).catch((e) => console.error(e.message));
