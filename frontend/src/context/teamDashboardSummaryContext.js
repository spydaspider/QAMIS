import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TeamDashboardContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const TeamDashboardProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const token = user?.token || null;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Keep React state in sync with localStorage (same tab + other tabs) ---
  useEffect(() => {
    // listen to cross-tab storage changes
    const onStorage = (e) => {
      if (e.key === "user") setUser(getStoredUser());
    };
    window.addEventListener("storage", onStorage);

    // patch same-tab localStorage updates to emit a custom event
    const LS_PATCH_FLAG = "__user_storage_patched__";
    if (!window[LS_PATCH_FLAG]) {
      const _set = localStorage.setItem.bind(localStorage);
      const _remove = localStorage.removeItem.bind(localStorage);

      localStorage.setItem = (k, v) => {
        _set(k, v);
        if (k === "user") window.dispatchEvent(new Event("user-storage"));
      };
      localStorage.removeItem = (k) => {
        _remove(k);
        if (k === "user") window.dispatchEvent(new Event("user-storage"));
      };
      window[LS_PATCH_FLAG] = true;
    }

    const onUserStorage = () => setUser(getStoredUser());
    window.addEventListener("user-storage", onUserStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("user-storage", onUserStorage);
    };
  }, []);

  // --- Fetch when token changes; clear old data immediately to avoid stale UI ---
  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    // whenever the token changes, reset state to avoid showing previous student's data
    setData(null);
    setLoading(true);

    const run = async () => {
      if (!token) {
        // logged out or no token -> nothing to fetch
        if (!aborted) setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/studentDashboard/teamSummary", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!aborted) setData(json);
      } catch (err) {
        if (!aborted) {
          console.error("Failed to load team dashboard:", err);
          setData(null);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    run();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [token]);

  // optional: expose a manual refetch
  const refetch = useMemo(() => {
    return async () => {
      // trigger by updating user state from storage (keeps a single source of truth)
      setUser(getStoredUser());
    };
  }, []);

  return (
    <TeamDashboardContext.Provider value={{ data, loading, refetch }}>
      {children}
    </TeamDashboardContext.Provider>
  );
};

export const useTeamDashboard = () => useContext(TeamDashboardContext);
