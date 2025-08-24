import styles from "./teamDashboardSummary.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useTeamDashboard } from "../context/teamDashboardSummaryContext";

const TeamDashboardSummary = () => {
  const { data, loading } = useTeamDashboard();

  if (loading) return <p>Loading team dashboard...</p>;
  if (!data) return <p>No team dashboard data available.</p>;

  const { team, totals, qaMetrics, alerts } = data;

  const chartData = [
    { name: "Tests Executed", value: qaMetrics.testsExecuted },
    { name: "Pass Rate %", value: qaMetrics.passRate },
    { name: "Coverage %", value: qaMetrics.avgTestCoverage },
    { name: "Open Defects", value: qaMetrics.openDefects },
    { name: "Closed Defects", value: qaMetrics.closedDefects },
    { name: "Critical Sev", value: qaMetrics.severityCritical },
    { name: "High Sev", value: qaMetrics.severityHigh },
  ];

  return (
    <div className={styles.container}>
      <h2>{team.name} Dashboard</h2>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h4>Bugs</h4>
          <p>{totals.bugs}</p>
        </div>
        <div className={styles.card}>
          <h4>Tests Designed</h4>
          <p>{totals.testsDesigned}</p>
        </div>
        <div className={styles.card}>
          <h4>Reports Considered</h4>
          <p>{totals.reportsConsidered}</p>
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
        {alerts && alerts.length > 0 ? (
          <ul>
            {alerts.map((alert, idx) => (
              <li key={idx} className={styles[`alert_${alert.type}`]}>
                ⚠ {alert.type} (value: {alert.value})
              </li>
            ))}
          </ul>
        ) : (
          <p>No alerts at this time </p>
        )}
      </div>
    </div>
  );
};

export default TeamDashboardSummary;
