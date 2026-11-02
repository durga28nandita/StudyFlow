import { useState, useEffect, useRef } from "react";
import { Clock, CalendarDays, BookOpen, ClipboardList } from "lucide-react";
import StatCard from "../components/StatCard";
import StudyLogForm from "../components/StudyLogForm";
import StudyLogItem from "../components/StudyLogItem";
import SubjectTimeChart from "../components/SubjectTimeChart";
import { loadData, saveData } from "../utils/storage";
import { toDateString, addDays, getWeekStart, formatDuration } from "../utils/dateUtils";
import "../styles/StudyTracker.css";

// Subjects belong to the Study Planner. We only READ them here.
const SUBJECTS_KEY = "studyflow-subjects";
const LOGS_KEY = "studyflow-study-logs";
const RECENT_LIMIT = 8;
const REMOVED_COLOR = "#9b94b8";

// ---------- Helpers ----------
function loadSubjects() {
  const saved = loadData(SUBJECTS_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

// Protects against broken or hand-edited LocalStorage values
function loadLogs() {
  const saved = loadData(LOGS_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved.filter(
    (log) => log && typeof log.date === "string" && Number.isFinite(log.minutes)
  );
}

function sumMinutes(list) {
  return list.reduce((sum, log) => sum + log.minutes, 0);
}

function StudyTracker({ onNavigate }) {
  const [subjects] = useState(loadSubjects); // read-only
  const [logs, setLogs] = useState(loadLogs);
  const [editingLog, setEditingLog] = useState(null); // null = adding
  const [showAll, setShowAll] = useState(false);
  const formRef = useRef(null);

  // Save to LocalStorage whenever logs change
  useEffect(() => {
    saveData(LOGS_KEY, logs);
  }, [logs]);

  // ---------- Handlers ----------
  const addLog = (values) => {
    setLogs([...logs, { id: Date.now(), ...values }]);
  };

  const updateLog = (values) => {
    setLogs(logs.map((l) => (l.id === editingLog.id ? { ...l, ...values } : l)));
    setEditingLog(null);
  };

  const handleSubmit = (values) => {
    if (editingLog) {
      updateLog(values);
    } else {
      addLog(values);
    }
  };

  const deleteLog = (id) => {
    if (!window.confirm("Delete this study log?")) return;
    setLogs(logs.filter((l) => l.id !== id));
    if (editingLog && editingLog.id === id) {
      setEditingLog(null);
    }
  };

  const startEditing = (log) => {
    setEditingLog(log);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ---------- Derived data (everything is calculated from `logs`) ----------
  const todayString = toDateString(new Date());
  const weekStart = getWeekStart(new Date());
  const weekStartString = toDateString(weekStart);
  const weekEndString = toDateString(addDays(weekStart, 6));

  const todayMinutes = sumMinutes(logs.filter((l) => l.date === todayString));
  const weekMinutes = sumMinutes(
    logs.filter((l) => l.date >= weekStartString && l.date <= weekEndString)
  );
  const allTimeMinutes = sumMinutes(logs);

  // Total time for each subject created in the Study Planner
  const subjectTotals = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
    minutes: sumMinutes(logs.filter((l) => l.subjectId === subject.id)),
  }));

  // Logs whose subject was deleted in the planner go into one extra bucket
  const knownIds = subjects.map((s) => s.id);
  const orphanLogs = logs.filter((l) => !knownIds.includes(l.subjectId));
  if (orphanLogs.length > 0) {
    subjectTotals.push({
      id: "removed",
      name: "Removed subjects",
      color: REMOVED_COLOR,
      minutes: sumMinutes(orphanLogs),
    });
  }

  subjectTotals.sort((a, b) => b.minutes - a.minutes);
  const maxMinutes = subjectTotals.length ? subjectTotals[0].minutes : 0;
  const chartData = subjectTotals.filter((s) => s.minutes > 0);

  // Find the live name/colour for a log, or fall back to its saved name
  const getSubjectInfo = (log) => {
    const subject = subjects.find((s) => s.id === log.subjectId);
    if (subject) return { name: subject.name, color: subject.color };
    return {
      name: `${log.subjectName || "Unknown subject"} (removed)`,
      color: REMOVED_COLOR,
    };
  };

  // Newest first: by date, then by creation time (the id is a timestamp)
  const sortedLogs = [...logs].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id
  );
  const visibleLogs = showAll ? sortedLogs : sortedLogs.slice(0, RECENT_LIMIT);

  return (
    <div className="st-page">
      <div className="st-heading">
        <h2>Study Tracker</h2>
        <p>Log what you study and see where your time goes.</p>
      </div>

      <div className="st-stats">
        <StatCard
          icon={Clock}
          title="Studied Today"
          value={formatDuration(todayMinutes)}
          subtitle="Logged for today"
        />
        <StatCard
          icon={CalendarDays}
          title="This Week"
          value={formatDuration(weekMinutes)}
          subtitle="Monday to Sunday"
        />
        <StatCard
          icon={BookOpen}
          title="All Time"
          value={formatDuration(allTimeMinutes)}
          subtitle={`${logs.length} log${logs.length === 1 ? "" : "s"} overall`}
        />
      </div>

      {/* Row 1: form + chart */}
      <div className="st-two-col">
        <div ref={formRef}>
          {/* The key resets the form when switching between add / edit */}
          <StudyLogForm
            key={editingLog ? editingLog.id : "new"}
            subjects={subjects}
            initialLog={editingLog}
            onSubmit={handleSubmit}
            onCancel={() => setEditingLog(null)}
          />
        </div>

        <SubjectTimeChart data={chartData} />
      </div>

      {/* Row 2: subject totals + history */}
      <div className="st-two-col st-two-col-history">
        <section className="st-card">
          <h3 className="st-card-title">Subjects</h3>

          {subjectTotals.length === 0 ? (
            <div className="st-empty small">
              <BookOpen size={34} />
              <h4>No subjects yet</h4>
              <p>Subjects are created in the Study Planner.</p>
              <button className="st-btn" onClick={() => onNavigate("Study Planner")}>
                Open Study Planner
              </button>
            </div>
          ) : (
            <ul className="st-subject-list">
              {subjectTotals.map((s) => (
                <li
                  key={s.id}
                  className="st-subject"
                  style={{ "--subject-color": s.color }}
                >
                  <div className="st-subject-top">
                    <span className="st-dot" />
                    <span className="st-subject-name">{s.name}</span>
                    <span className="st-subject-time">{formatDuration(s.minutes)}</span>
                  </div>
                  <div className="st-bar">
                    <div
                      className="st-bar-fill"
                      style={{
                        width: `${maxMinutes ? (s.minutes / maxMinutes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="st-card">
          <div className="st-card-header">
            <h3 className="st-card-title">Recent Study Sessions</h3>
            {logs.length > 0 && <span className="st-count">{logs.length}</span>}
          </div>

          {logs.length === 0 ? (
            <div className="st-empty">
              <ClipboardList size={42} />
              <h4>No study logs yet</h4>
              <p>Add your first log with the form and it will appear here.</p>
            </div>
          ) : (
            <>
              <ul className="st-list">
                {visibleLogs.map((log) => (
                  <StudyLogItem
                    key={log.id}
                    log={log}
                    subject={getSubjectInfo(log)}
                    isBeingEdited={editingLog?.id === log.id}
                    onEdit={startEditing}
                    onDelete={deleteLog}
                  />
                ))}
              </ul>

              {logs.length > RECENT_LIMIT && (
                <button
                  className="st-link-btn"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show fewer" : `Show all ${logs.length} logs`}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudyTracker;