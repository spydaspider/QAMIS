import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from '../hooks/useAuthContext';

import axios from "axios";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
    const { user } = useAuthContext();
  

  useEffect(() => {
  const fetchSummary = async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/dashboard/summary", {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard summary", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  fetchSummary();
}, [user]);


  return (
    <DashboardContext.Provider value={{ data, loading }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
