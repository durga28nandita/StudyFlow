import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import StudyPlanner from "./pages/StudyPlanner";
import FocusTimer from "./pages/FocusTimer";
import StudyTracker from "./pages/StudyTracker";
import Analytics from "./pages/Analytics";
import "./App.css";

function App() {
  // Tracks which page is active (no router needed for now)
  const [activePage, setActivePage] = useState("Dashboard");

  // Decide which page to show based on the sidebar selection
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
        // onNavigate lets the tracker link to the Study Planner
        return <StudyTracker onNavigate={setActivePage} />;
      case "Analytics":
        // onNavigate lets the empty state link to the pages that create data
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
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;