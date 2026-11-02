import {
  GraduationCap,
  LayoutDashboard,
  CheckSquare,
  CalendarClock,
  Timer,
  BookOpen,
  BarChart3,
} from "lucide-react";
import "../styles/Sidebar.css";

// The `name` values must match the `case` labels in App.jsx
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Tasks", icon: CheckSquare },
  { name: "Study Planner", icon: CalendarClock },
  { name: "Focus Timer", icon: Timer },
  { name: "Study Tracker", icon: BookOpen },
  { name: "Analytics", icon: BarChart3 },
];

function Sidebar({ activePage, onNavigate }) {
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
            // On mobile the text label is hidden, so screen readers need this
            aria-label={name}
            aria-current={activePage === name ? "page" : undefined}
            onClick={() => onNavigate(name)}
          >
            <Icon size={20} />
            <span>{name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;