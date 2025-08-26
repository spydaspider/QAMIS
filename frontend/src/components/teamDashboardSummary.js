import styles from "./teamDashboardSummary.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useTeamDashboard } from "../context/teamDashboardSummaryContext";

const TeamDashboardSummary = () => {
  const { data, loading } = useTeamDashboard();

  if (loading) return <p>Loading team dashboard...</p>;
  if (!data) return <p>No team dashboard data available.</p>;

  // Destructure with safe defaults
  const { 
    team = {}, 
    totals = {}, 
    qaMetrics = {}, 
    alerts = [] 
  } = data;

  // Chart data with nullish coalescing
  const chartData = [
    { name: "Tests Executed", value: qaMetrics.testsExecuted ?? 0 },
    { name: "Pass Rate %", value: qaMetrics.passRate ?? 0 },
    { name: "Coverage %", value: qaMetrics.avgTestCoverage ?? 0 },
    { name: "Open Defects", value: qaMetrics.openDefects ?? 0 },
    { name: "Closed Defects", value: qaMetrics.closedDefects ?? 0 },
    { name: "Critical Sev", value: qaMetrics.severityCritical ?? 0 },
    { name: "High Sev", value: qaMetrics.severityHigh ?? 0 },
  ];

  return (
    <div className={styles.container}>
      <h2>{team.name ?? "Unnamed Team"} Dashboard</h2>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h4>Bugs</h4>
          <p>{totals.bugs ?? 0}</p>
        </div>
        <div className={styles.card}>
          <h4>Tests Designed</h4>
          <p>{totals.testsDesigned ?? 0}</p>
        </div>
        <div className={styles.card}>
          <h4>Reports Considered</h4>
          <p>{totals.reportsConsidered ?? 0}</p>
        </div>
      </div>

      {/* QA Metrics Chart */}
      <div className={styles.chartSection}>
        <h3>QA Metrics</h3>
        <BarChart width={700} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#2A5298" />
        </BarChart>
      </div>

      {/* Alerts */}
      <div className={styles.alertsSection}>
        <h3>Team Alerts</h3>
        {alerts.length > 0 ? (
          <ul>
            {alerts.map((alert, idx) => (
              <li key={idx} className={styles[`alert_${alert.type}`] || styles.alert_default}>
                ⚠ {alert.type ?? "Unknown"} (value: {alert.value ?? "N/A"})
              </li>
            ))}
          </ul>
        ) : (
          <p>No alerts at this time</p>
        )}
      </div>
    </div>
  );
};

export default TeamDashboardSummary;
