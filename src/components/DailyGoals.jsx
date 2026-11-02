import { useState, useEffect } from "react";
import { Target, Pencil, Save, X, Clock, CheckCircle2, Trophy } from "lucide-react";
import { loadData, saveData } from "../utils/storage";
import { toDateString, formatDuration } from "../utils/dateUtils";
import "../styles/DailyGoals.css";

const GOALS_KEY = "studyflow-daily-goals";
const LOGS_KEY = "studyflow-study-logs"; // written by the Study Tracker (read-only here)
const DEFAULT_GOALS = { studyMinutes: 180, tasks: 4 };

// ---------- Helpers ----------
function safeInt(value, max, fallback) {
  return Number.isInteger(value) && value >= 0 && value <= max ? value : fallback;
}

// Protects against broken or hand-edited LocalStorage values
function loadGoals() {
  const saved = loadData(GOALS_KEY, DEFAULT_GOALS);
  return {
    studyMinutes: safeInt(saved?.studyMinutes, 24 * 60, DEFAULT_GOALS.studyMinutes),
    tasks: safeInt(saved?.tasks, 50, DEFAULT_GOALS.tasks),
  };
}

function loadTodayStudyMinutes(today) {
  const saved = loadData(LOGS_KEY, []);
  if (!Array.isArray(saved)) return 0;
  return saved
    .filter((log) => log && log.date === today && Number.isFinite(log.minutes))
    .reduce((sum, log) => sum + log.minutes, 0);
}

// 0 to 100. A goal of 0 means "not set", so progress is 0 (never divides by zero).
function percent(actual, goal) {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((actual / goal) * 100));
}

// One progress bar row
function GoalRow({ icon: Icon, title, actual, goal, unit, detail }) {
  const isSet = goal > 0;
  const pct = percent(actual, goal);
  const reached = isSet && actual >= goal;

  let note;
  if (!isSet) note = "No goal set";
  else if (reached) note = "Goal reached!";
  else note = `${goal - actual} ${unit} to go`;

  return (
    <div className={`dg-goal ${reached ? "reached" : ""} ${isSet ? "" : "unset"}`}>
      <div className="dg-goal-top">
        <div className="dg-goal-icon">
          <Icon size={18} />
        </div>
        <div className="dg-goal-text">
          <p className="dg-goal-title">{title}</p>
          <p className="dg-goal-value">
            {actual} / {goal} {unit}
          </p>
        </div>
        <span className="dg-pct">{isSet ? `${pct}%` : "–"}</span>
      </div>

      <div
        className="dg-track"
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="dg-fill" style={{ width: `${pct}%` }} />
      </div>

      <p className="dg-note">
        {note}
        {detail && isSet ? ` · ${detail}` : ""}
      </p>
    </div>
  );
}

// `tasks` is the Dashboard's task list. Each completed task has a `completedOn` date.
function DailyGoals({ tasks }) {
  const [goals, setGoals] = useState(loadGoals);
  const [today, setToday] = useState(() => toDateString(new Date()));
  const [editing, setEditing] = useState(false);

  // Form values are kept as strings while typing
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [taskGoal, setTaskGoal] = useState("");
  const [error, setError] = useState("");

  // Save goal targets whenever they change
  useEffect(() => {
    saveData(GOALS_KEY, goals);
  }, [goals]);

  // If the Dashboard stays open past midnight, roll over to the new day
  useEffect(() => {
    const id = setInterval(() => {
      setToday(toDateString(new Date()));
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ---------- Today's actual progress ----------
  // Study time comes from today's Study Tracker logs. (The Dashboard remounts
  // on every visit, so this is read fresh each time. Logs can't change here.)
  const studiedMinutes = loadTodayStudyMinutes(today);

  // A task counts if it is done AND was ticked today
  const completedToday = tasks.filter((t) => t.done && t.completedOn === today).length;

  const studyGoalSet = goals.studyMinutes > 0;
  const taskGoalSet = goals.tasks > 0;
  const studyReached = studyGoalSet && studiedMinutes >= goals.studyMinutes;
  const tasksReached = taskGoalSet && completedToday >= goals.tasks;
  // Every goal that is set has been met (and at least one is set)
  const allReached =
    (studyGoalSet || taskGoalSet) &&
    (!studyGoalSet || studyReached) &&
    (!taskGoalSet || tasksReached);

  // ---------- Editing ----------
  const startEditing = () => {
    setHours(String(Math.floor(goals.studyMinutes / 60)));
    setMinutes(String(goals.studyMinutes % 60));
    setTaskGoal(String(goals.tasks));
    setError("");
    setEditing(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const h = Number(hours); // an empty box becomes 0
    const m = Number(minutes);
    const t = Number(taskGoal);

    if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 24 || m < 0 || m > 59) {
      setError("Hours must be 0 to 24 and minutes 0 to 59.");
      return;
    }
    if (h * 60 + m > 24 * 60) {
      setError("A daily study goal can't be longer than 24 hours.");
      return;
    }
    if (!Number.isInteger(t) || t < 0 || t > 50) {
      setError("The task goal must be a whole number from 0 to 50.");
      return;
    }

    setGoals({ studyMinutes: h * 60 + m, tasks: t });
    setEditing(false);
  };

  return (
    <section className="dg-card">
      <div className="dg-header">
        <div className="dg-title">
          <Target size={20} />
          <h2>Daily Goals</h2>
        </div>

        {!editing && (
          <button className="dg-edit-btn" onClick={startEditing}>
            <Pencil size={15} />
            Set goals
          </button>
        )}
      </div>

      {editing ? (
        <form className="dg-form" onSubmit={handleSubmit}>
          <div className="dg-field">
            <label htmlFor="goal-hours">Study hours</label>
            <input
              id="goal-hours"
              type="number"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => {
                setHours(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="dg-field">
            <label htmlFor="goal-minutes">Study minutes</label>
            <input
              id="goal-minutes"
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => {
                setMinutes(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="dg-field">
            <label htmlFor="goal-tasks">Tasks to complete</label>
            <input
              id="goal-tasks"
              type="number"
              min="0"
              max="50"
              value={taskGoal}
              onChange={(e) => {
                setTaskGoal(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="dg-form-actions">
            <button type="submit" className="dg-btn primary">
              <Save size={16} />
              Save
            </button>
            <button type="button" className="dg-btn secondary" onClick={() => setEditing(false)}>
              <X size={16} />
              Cancel
            </button>
          </div>

          <p className="dg-hint">Use 0 to switch a goal off.</p>
          {error && <span className="dg-error">{error}</span>}
        </form>
      ) : (
        <>
          <div className="dg-goals">
            <GoalRow
              icon={Clock}
              title="Study time"
              actual={studiedMinutes}
              goal={goals.studyMinutes}
              unit="minutes"
              detail={formatDuration(studiedMinutes)}
            />
            <GoalRow
              icon={CheckCircle2}
              title="Tasks"
              actual={completedToday}
              goal={goals.tasks}
              unit="completed"
            />
          </div>

          {allReached && (
            <div className="dg-celebrate" role="status">
              <Trophy size={20} />
              <p>Both goals smashed today. Brilliant work, enjoy a well-earned break!</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DailyGoals;