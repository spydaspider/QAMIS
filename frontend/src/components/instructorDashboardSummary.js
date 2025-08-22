import styles from "./instructorDashboardSummary.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useDashboard } from "../context/instructorDashboardSummaryContext";

const InstructorControlPanel = () => {
  const { data, loading } = useDashboard();

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>No dashboard data found.</p>;

  const { totals, qaMetrics, perTeamSummaries, alerts } = data;

  const chartData = Object.values(perTeamSummaries).map(team => ({
    name: team.teamName,
    Executed: team.testsExecuted,
    PassRate: team.passRate,
  }));

  return (
    <div className={styles.container}>
      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h4>Teams</h4>
          <p>{totals.teams}</p>
        </div>
        <div className={styles.card}>
          <h4>Users</h4>
          <p>{totals.users}</p>
        </div>
        <div className={styles.card}>
          <h4>Experiments</h4>
          <p>{totals.experiments}</p>
        </div>
        <div className={styles.card}>
          <h4>Bugs</h4>
          <p>{totals.bugs}</p>
        </div>
        <div className={styles.card}>
          <h4>Tests Designed</h4>
          <p>{qaMetrics.testsDesigned}</p>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartSection}>
        <h3>Team QA Metrics</h3>
        <BarChart width={700} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Executed" fill="#2A5298" />
          <Bar dataKey="PassRate" fill="#82ca9d" />
        </BarChart>
      </div>

      {/* Alerts */}
      <div className={styles.alertsSection}>
        <h3>Team Alerts</h3>
        {alerts && alerts.length > 0 ? (
          <ul>
            {alerts.map((alert, idx) => (
              <li key={idx} className={styles[`alert_${alert.type}`]}>
                <strong>{alert.team}</strong> - {alert.type} (value: {alert.value})
              </li>
            ))}
          </ul>
        ) : (
          <p>No alerts at this time ✅</p>
        )}
      </div>
    </div>
  );
};

export default InstructorControlPanel;
