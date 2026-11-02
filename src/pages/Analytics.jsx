import { useState, useEffect } from "react";
import { Clock, Timer, CheckCircle2, BookOpen, BarChart3 } from "lucide-react";
import StatCard from "../components/StatCard";
import WeeklyStudyChart from "../components/WeeklyStudyChart";
import SubjectTimeChart from "../components/SubjectTimeChart";
import TaskAnalytics from "../components/TaskAnalytics";
import FocusAnalytics from "../components/FocusAnalytics";
import { loadData } from "../utils/storage";
import { toDateString, addDays, getWeekStart, formatDuration } from "../utils/dateUtils";
import "../styles/StudyTracker.css"; // SubjectTimeChart is styled by these classes
import "../styles/Analytics.css";

// These are the keys the other pages already save to. Analytics only READS them.
const TASKS_KEY = "studyflow-tasks";
const SUBJECTS_KEY = "studyflow-subjects";
const LOGS_KEY = "studyflow-study-logs";
const FOCUS_KEY = "studyflow-focus-sessions";

const PERIODS = ["Today", "This Week", "This Month", "All Time"];
const PERIOD_TEXT = {
  Today: "today",
  "This Week": "this week",
  "This Month": "this month",
  "All Time": "all time",
};
const REMOVED_COLOR = "#9b94b8";

// ---------- Loading helpers ----------
function loadList(key) {
  const saved = loadData(key, []);
  return Array.isArray(saved) ? saved : [];
}

// Study logs and focus sessions both need a date string and a number of minutes
function isValidRecord(record) {
  return (
    record && typeof record.date === "string" && Number.isFinite(record.minutes)
  );
}

// Reads everything Analytics needs from LocalStorage
function readAllData() {
  return {
    tasks: loadList(TASKS_KEY).filter((t) => t && typeof t === "object"),
    subjects: loadList(SUBJECTS_KEY).filter((s) => s && typeof s === "object"),
    logs: loadList(LOGS_KEY).filter(isValidRecord),
    focusSessions: loadList(FOCUS_KEY).filter(isValidRecord),
  };
}

// ---------- Date range helpers ----------
// Returns { start, end } as "YYYY-MM-DD" strings. All Time has no limits.
function getPeriodRange(period) {
  const now = new Date();
  const today = toDateString(now);

  if (period === "Today") {
    return { start: today, end: today };
  }
  if (period === "This Week") {
    const monday = getWeekStart(now);
    return { start: toDateString(monday), end: toDateString(addDays(monday, 6)) };
  }
  if (period === "This Month") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: toDateString(first), end: toDateString(last) };
  }
  return { start: null, end: null };
}

// "YYYY-MM-DD" strings can be compared directly
function inRange(dateString, range) {
  if (!range.start) return true;
  return dateString >= range.start && dateString <= range.end;
}

function sumMinutes(list) {
  return list.reduce((sum, item) => sum + item.minutes, 0);
}

function Analytics({ onNavigate }) {
  const [data, setData] = useState(readAllData);
  const [period, setPeriod] = useState("This Week");

  // Refresh if data changes in another browser tab
  useEffect(() => {
    const refresh = () => setData(readAllData());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const { tasks, subjects, logs, focusSessions } = data;
  const todayString = toDateString(new Date());

  // ---------- Page heading (shared by both layouts below) ----------
  const heading = (
    <div className="an-heading">
      <h2>Analytics</h2>
      <p>See how your study time, tasks and focus sessions add up.</p>
    </div>
  );

  // ---------- Nothing saved anywhere yet ----------
  const hasAnyData = logs.length + focusSessions.length + tasks.length > 0;
  if (!hasAnyData) {
    return (
      <div className="an-page">
        {heading}
        <section className="an-card an-empty large">
          <BarChart3 size={48} />
          <h4>No data to analyse yet</h4>
          <p>
            Analytics are built from your real activity. Log study time, add
            tasks or finish a focus session and your statistics will appear here.
          </p>
          <div className="an-empty-actions">
            <button className="an-btn" onClick={() => onNavigate("Study Tracker")}>
              Log study time
            </button>
            <button className="an-btn ghost" onClick={() => onNavigate("Tasks")}>
              Add a task
            </button>
            <button className="an-btn ghost" onClick={() => onNavigate("Focus Timer")}>
              Start a focus session
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ---------- Data for the selected period ----------
  const range = getPeriodRange(period);
  const periodLogs = logs.filter((l) => inRange(l.date, range));
  const periodFocus = focusSessions.filter((s) => inRange(s.date, range));

  const periodMinutes = sumMinutes(periodLogs);
  const subjectsStudied = new Set(periodLogs.map((l) => l.subjectId)).size;
  const completedTasks = tasks.filter((t) => t.done).length;

  // Study time for each subject (same approach as the Study Tracker page)
  const subjectTotals = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
    minutes: sumMinutes(periodLogs.filter((l) => l.subjectId === subject.id)),
  }));

  // Logs whose subject was deleted in the Study Planner go into one extra bucket
  const knownIds = subjects.map((s) => s.id);
  const removedMinutes = sumMinutes(
    periodLogs.filter((l) => !knownIds.includes(l.subjectId))
  );
  if (removedMinutes > 0) {
    subjectTotals.push({
      id: "removed",
      name: "Removed subjects",
      color: REMOVED_COLOR,
      minutes: removedMinutes,
    });
  }

  const subjectChartData = subjectTotals
    .filter((s) => s.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  // ---------- Daily chart data: always the current week, Monday to Sunday ----------
  const weekStart = getWeekStart(new Date());
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateString = toDateString(date);
    const minutes = sumMinutes(logs.filter((l) => l.date === dateString));
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      minutes,
      hours: Math.round((minutes / 60) * 100) / 100,
      isToday: dateString === todayString,
    };
  });

  const periodText = PERIOD_TEXT[period];

  return (
    <div className="an-page">
      <div className="an-top">
        {heading}

        <div className="an-filters" role="group" aria-label="Date filter">
          {PERIODS.map((name) => (
            <button
              key={name}
              className={`an-filter ${period === name ? "active" : ""}`}
              aria-pressed={period === name}
              onClick={() => setPeriod(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* ----- Overview ----- */}
      <section className="an-section">
        <div className="an-section-head">
          <h3>Study Overview</h3>
          <p>
            Study time, focus sessions and subjects follow the filter above.
            Tasks always show all of your tasks.
          </p>
        </div>

        <div className="an-stats">
          <StatCard
            icon={Clock}
            title="Total Study Time"
            value={formatDuration(periodMinutes)}
            subtitle={`Logged ${periodText}`}
          />
          <StatCard
            icon={Timer}
            title="Focus Sessions"
            value={periodFocus.length}
            subtitle={`Completed ${periodText}`}
          />
          <StatCard
            icon={CheckCircle2}
            title="Tasks Completed"
            value={completedTasks}
            subtitle={`Out of ${tasks.length} total tasks`}
          />
          <StatCard
            icon={BookOpen}
            title="Subjects Studied"
            value={subjectsStudied}
            subtitle={`Studied ${periodText}`}
          />
        </div>
      </section>

      {/* ----- Study time charts ----- */}
      <section className="an-section">
        <div className="an-section-head">
          <h3>Study Time</h3>
          <p>From your Study Tracker logs.</p>
        </div>

        <div className="an-two-col">
          <WeeklyStudyChart data={weekData} />

          {subjectChartData.length === 0 ? (
            <div className="an-card">
              <h3 className="an-card-title">Study Time by Subject</h3>
              <div className="an-empty">
                <BarChart3 size={40} />
                <h4>No study logs {periodText}</h4>
                <p>Try a different period, or add a log in the Study Tracker.</p>
              </div>
            </div>
          ) : (
            <SubjectTimeChart data={subjectChartData} />
          )}
        </div>
      </section>

      {/* ----- Task + focus analytics ----- */}
      <div className="an-two-col">
        <TaskAnalytics tasks={tasks} today={todayString} />
        <FocusAnalytics sessions={periodFocus} periodText={periodText} />
      </div>
    </div>
  );
}

export default Analytics;