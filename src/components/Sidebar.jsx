
import {
  GraduationCap,
  LayoutDashboard,
  CheckSquare,
  CalendarClock,
  Timer,
  BookOpen,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";

import "../styles/Sidebar.css";

// Navigation items
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Tasks", icon: CheckSquare },
  { name: "Study Planner", icon: CalendarClock },
  { name: "Focus Timer", icon: Timer },
  { name: "Study Tracker", icon: BookOpen },
  { name: "Analytics", icon: BarChart3 },
];

function Sidebar({ activePage, onNavigate, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <GraduationCap size={22} />
        </div>
        <span className="logo-text">StudyFlow</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`nav-link ${activePage === name ? "active" : ""}`}
            aria-label={name}
            aria-current={activePage === name ? "page" : undefined}
            onClick={() => onNavigate(name)}
          >
            <Icon size={20} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      {/* Theme toggle */}
      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={
          theme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
        }
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>
    </aside>
  );
}

export default Sidebar;
