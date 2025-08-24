import { createContext, useContext, useEffect, useState } from "react";

const TeamDashboardContext = createContext();

export const TeamDashboardProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/studentDashboard/teamSummary", {
          credentials: "include",
          headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type":"application/json"
  }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load team dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <TeamDashboardContext.Provider value={{ data, loading }}>
      {children}
    </TeamDashboardContext.Provider>
  );
};

export const useTeamDashboard = () => useContext(TeamDashboardContext);
