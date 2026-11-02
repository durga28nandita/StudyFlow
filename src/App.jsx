
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import StudyPlanner from "./pages/StudyPlanner";
import FocusTimer from "./pages/FocusTimer";
import StudyTracker from "./pages/StudyTracker";
import Analytics from "./pages/Analytics";
import "./App.css";

function App() {
  // Tracks which page is active
  const [activePage, setActivePage] = useState("Dashboard");

  // Tracks the selected theme
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("studyflow-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  // Applies the theme and saves the preference
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("studyflow-theme", theme);
    } catch {
      // App will still work if LocalStorage is unavailable
    }
  }, [theme]);

  // Switches between dark and light themes
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  // Decide which page to show
  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;
      case "Tasks":
        return <Tasks />;
      case "Study Planner":
        return <StudyPlanner />;
      case "Focus Timer":
        return <FocusTimer />;
      case "Study Tracker":
        return <StudyTracker onNavigate={setActivePage} />;
      case "Analytics":
        return <Analytics onNavigate={setActivePage} />;
      default:
        return (
          <div className="placeholder">
            <h2>{activePage}</h2>
            <p>This page is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
