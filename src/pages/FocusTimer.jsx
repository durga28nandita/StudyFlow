import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Clock,
  Trophy,
  Brain,
  Coffee,
  CheckCircle2,
} from "lucide-react";
import StatCard from "../components/StatCard";
import TimerRing from "../components/TimerRing";
import TimerSettings from "../components/TimerSettings";
import { loadData, saveData } from "../utils/storage";
import { toDateString, formatDuration } from "../utils/dateUtils";
import "../styles/FocusTimer.css";

const SETTINGS_KEY = "studyflow-timer-settings";
const SESSIONS_KEY = "studyflow-focus-sessions";
const DEFAULT_SETTINGS = { focusMinutes: 25, breakMinutes: 5 };

// ---------- Helpers ----------
// Protects against broken or hand-edited LocalStorage values
function safeMinutes(value, max, fallback) {
  return Number.isInteger(value) && value >= 1 && value <= max ? value : fallback;
}

function loadSettings() {
  const saved = loadData(SETTINGS_KEY, DEFAULT_SETTINGS);
  return {
    focusMinutes: safeMinutes(saved.focusMinutes, 120, DEFAULT_SETTINGS.focusMinutes),
    breakMinutes: safeMinutes(saved.breakMinutes, 60, DEFAULT_SETTINGS.breakMinutes),
  };
}

function loadSessions() {
  const saved = loadData(SESSIONS_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

// 1500 -> "25:00"
function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function FocusTimer() {
  const [settings, setSettings] = useState(loadSettings);
  const [sessions, setSessions] = useState(loadSessions);

  // The timer itself is NOT saved to LocalStorage (see "How it works")
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [status, setStatus] = useState("idle"); // "idle" | "running" | "paused"
  const [remaining, setRemaining] = useState(() => settings.focusMinutes * 60);
  const [message, setMessage] = useState("");

  // The exact moment (in ms) the running timer should hit zero
  const endTimeRef = useRef(null);

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    saveData(SETTINGS_KEY, settings);
  }, [settings]);

  useEffect(() => {
    saveData(SESSIONS_KEY, sessions);
  }, [sessions]);

  // ---------- The countdown ----------
  // This effect only creates an interval while status is "running".
  // The cleanup function stops it when the status changes, when the
  // settings or mode change, and when the page unmounts, so two
  // intervals can never run at once.
  useEffect(() => {
    if (status !== "running") return;

    const intervalId = setInterval(() => {
      const secondsLeft = Math.ceil((endTimeRef.current - Date.now()) / 1000);

      if (secondsLeft > 0) {
        setRemaining(secondsLeft);
        return;
      }

      // ----- The timer reached zero -----
      clearInterval(intervalId);

      if (mode === "focus") {
        const now = new Date();
        const finishedSession = {
          id: now.getTime(),
          date: toDateString(now),
          minutes: settings.focusMinutes,
          completedAt: now.toISOString(),
        };
        setSessions((previous) => [...previous, finishedSession]);
        setMode("break");
        setRemaining(settings.breakMinutes * 60);
        setMessage("Focus session complete! Time for a break.");
      } else {
        setMode("focus");
        setRemaining(settings.focusMinutes * 60);
        setMessage("Break over. Ready for another focus session?");
      }

      setStatus("idle");
    }, 250);

    return () => clearInterval(intervalId);
  }, [status, mode, settings]);

  // ---------- Button handlers ----------
  const durationFor = (whichMode, currentSettings = settings) =>
    (whichMode === "focus" ? currentSettings.focusMinutes : currentSettings.breakMinutes) * 60;

  // Used for both Start and Resume
  const handleStart = () => {
    endTimeRef.current = Date.now() + remaining * 1000;
    setMessage("");
    setStatus("running");
  };

  const handlePause = () => {
    const secondsLeft = Math.ceil((endTimeRef.current - Date.now()) / 1000);
    setRemaining(Math.max(1, secondsLeft));
    setStatus("paused");
  };

  const handleReset = () => {
    setStatus("idle");
    setRemaining(durationFor(mode));
    setMessage("");
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setRemaining(durationFor(newMode));
    setMessage("");
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setRemaining(durationFor(mode, newSettings));
  };

  // ---------- Derived data ----------
  const total = durationFor(mode);
  const progress = 1 - remaining / total; // 0 at the start, 1 at the end

  const todayString = toDateString(new Date());
  const todaySessions = sessions.filter((s) => s.date === todayString);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
  const allTimeMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);

  const statusText = { idle: "Ready", running: "Running", paused: "Paused" }[status];
  const isFocus = mode === "focus";

  return (
    <div className="ft-page">
      <div className="ft-heading">
        <h2>Focus Timer</h2>
        <p>Stay in the zone with focused study sprints and short breaks.</p>
      </div>

      <div className="ft-stats">
        <StatCard
          icon={Timer}
          title="Sessions Today"
          value={todaySessions.length}
          subtitle="Focus sessions completed"
        />
        <StatCard
          icon={Clock}
          title="Focus Time Today"
          value={formatDuration(todayMinutes)}
          subtitle="Time spent focusing"
        />
        <StatCard
          icon={Trophy}
          title="Total Focus Time"
          value={formatDuration(allTimeMinutes)}
          subtitle={`${sessions.length} session${sessions.length === 1 ? "" : "s"} overall`}
        />
      </div>

      <div className="ft-two-col">
        {/* ----- Timer ----- */}
        <section className="ft-card ft-timer-card">
          <div className="ft-modes">
            <button
              className={`ft-mode-btn ${isFocus ? "active" : ""}`}
              onClick={() => handleModeChange("focus")}
              disabled={status !== "idle"}
            >
              <Brain size={16} />
              Focus
            </button>
            <button
              className={`ft-mode-btn ${!isFocus ? "active" : ""}`}
              onClick={() => handleModeChange("break")}
              disabled={status !== "idle"}
            >
              <Coffee size={16} />
              Break
            </button>
          </div>

          <TimerRing progress={progress} mode={mode}>
            <span className="ft-mode-label">
              {isFocus ? <Brain size={16} /> : <Coffee size={16} />}
              {isFocus ? "Focus Session" : "Break Time"}
            </span>
            <span className="ft-time">{formatClock(remaining)}</span>
            <span className="ft-status">{statusText}</span>
          </TimerRing>

          <p className="ft-message" role="status">
            {message}
          </p>

          <div className="ft-controls">
            {status === "running" ? (
              <button className="ft-btn primary" onClick={handlePause}>
                <Pause size={20} />
                Pause
              </button>
            ) : (
              <button className="ft-btn primary" onClick={handleStart}>
                <Play size={20} />
                {status === "paused" ? "Resume" : "Start"}
              </button>
            )}

            <button
              className="ft-btn secondary"
              onClick={handleReset}
              disabled={status === "idle"}
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </section>

        {/* ----- Settings + today's sessions ----- */}
        <div className="ft-side">
          <TimerSettings
            settings={settings}
            disabled={status !== "idle"}
            onSave={handleSaveSettings}
          />

          <section className="ft-card">
            <h3 className="ft-card-title">Today's Focus Sessions</h3>

            {todaySessions.length === 0 ? (
              <div className="ft-empty">
                <Timer size={38} />
                <h4>No focus sessions yet today</h4>
                <p>Finish a full focus session and it will show up here.</p>
              </div>
            ) : (
              <ul className="ft-list">
                {[...todaySessions].reverse().map((session) => (
                  <li key={session.id} className="ft-item">
                    <CheckCircle2 size={20} className="ft-item-icon" />
                    <div className="ft-item-info">
                      <p>Focus session</p>
                      <span>
                        Finished at{" "}
                        {new Date(session.completedAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span className="ft-item-duration">{formatDuration(session.minutes)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default FocusTimer;