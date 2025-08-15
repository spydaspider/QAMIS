import styles from "./instructorDashboardSummary.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useDashboard } from "../context/instructorDashboardSummaryContext";

const InstructorControlPanel = () => {
  const { data, loading } = useDashboard();

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>No dashboard data found.</p>;

  const { totals, qaMetrics, perTeamSummaries, recentActivity } = data;

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

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h3>Recent Activity</h3>
        <ul>
          {recentActivity.map((item, idx) => (
            <li key={idx}>
              <span className={styles.type}>{item.type}</span> - {item.title} ({item.team})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InstructorControlPanel;
