import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarX2,
  LayoutGrid,
} from "lucide-react";
import StatCard from "../components/StatCard";
import SubjectManager from "../components/SubjectManager";
import SessionForm from "../components/SessionForm";
import SessionCard from "../components/SessionCard";
import WeeklyTimetable from "../components/WeeklyTimetable";
import DailySchedule from "../components/DailySchedule";
import CalendarView from "../components/CalendarView";
import { loadData, saveData } from "../utils/storage";
import {
  toDateString,
  parseLocalDate,
  addDays,
  getWeekStart,
  timeToMinutes,
  formatDuration,
} from "../utils/dateUtils";
import "../styles/StudyPlanner.css";

const SUBJECTS_KEY = "studyflow-subjects";
const SESSIONS_KEY = "studyflow-sessions";
const VIEWS = ["Weekly", "Daily"];

// Shown if a session points to a subject that no longer exists
const FALLBACK_SUBJECT = { id: 0, name: "Unknown subject", color: "#9b94b8" };

// ---------- Sample data (used only the first time) ----------
const sampleSubjects = [
  { id: 1, name: "Math", color: "#8b5cf6" },
  { id: 2, name: "Biology", color: "#34d399" },
  { id: 3, name: "Physics", color: "#38bdf8" },
  { id: 4, name: "English", color: "#f472b6" },
];

// Sessions are created relative to the current week so the timetable isn't empty
function createSampleSessions() {
  const weekStart = getWeekStart(new Date());
  const dayString = (offset) => toDateString(addDays(weekStart, offset));
  const today = toDateString(new Date());

  return [
    { id: 101, subjectId: 1, topic: "Integration practice", date: dayString(0), startTime: "09:00", endTime: "10:30", done: false },
    { id: 102, subjectId: 2, topic: "Cell division notes", date: dayString(1), startTime: "11:00", endTime: "12:00", done: false },
    { id: 103, subjectId: 3, topic: "Newton's laws problems", date: dayString(2), startTime: "15:00", endTime: "16:30", done: false },
    { id: 104, subjectId: 4, topic: "Essay outline", date: dayString(3), startTime: "10:00", endTime: "11:00", done: false },
    { id: 105, subjectId: 1, topic: "Past paper review", date: dayString(4), startTime: "14:00", endTime: "15:30", done: false },
    { id: 106, subjectId: 2, topic: "Revise chapter 5", date: today, startTime: "09:00", endTime: "10:00", done: false },
    { id: 107, subjectId: 3, topic: "Lab report draft", date: today, startTime: "16:00", endTime: "17:00", done: false },
  ];
}

// First day of the month that contains `date`
function firstOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function StudyPlanner() {
  const [subjects, setSubjects] = useState(() => loadData(SUBJECTS_KEY, sampleSubjects));
  const [sessions, setSessions] = useState(() => loadData(SESSIONS_KEY, createSampleSessions()));
  const [editingSession, setEditingSession] = useState(null); // null = adding
  const [view, setView] = useState("Weekly");
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()));
  const formRef = useRef(null);

  // ----- Calendar view state (separate from the timetable's date) -----
  const [layout, setLayout] = useState("Timetable"); // "Timetable" | "Calendar"
  const [calendarMonth, setCalendarMonth] = useState(() => firstOfMonth(new Date()));
  const [calendarDate, setCalendarDate] = useState(() => toDateString(new Date()));
  // When the calendar's "Add session" button is used, the form opens on that date.
  // The nonce changes each time so the form remounts and picks up the new date.
  const [prefill, setPrefill] = useState({ date: null, nonce: 0 });

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    saveData(SUBJECTS_KEY, subjects);
  }, [subjects]);

  useEffect(() => {
    saveData(SESSIONS_KEY, sessions);
  }, [sessions]);

  // ---------- Subject handlers ----------
  const addSubject = ({ name, color }) => {
    setSubjects([...subjects, { id: Date.now(), name, color }]);
  };

  const updateSubject = (id, values) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, ...values } : s)));
  };

  const deleteSubject = (id) => {
    const subject = subjects.find((s) => s.id === id);
    const sessionCount = sessions.filter((s) => s.subjectId === id).length;
    const message = sessionCount
      ? `Delete "${subject.name}" and its ${sessionCount} scheduled session(s)?`
      : `Delete "${subject.name}"?`;
    if (!window.confirm(message)) return;

    setSubjects(subjects.filter((s) => s.id !== id));
    setSessions(sessions.filter((s) => s.subjectId !== id));
    if (editingSession && editingSession.subjectId === id) {
      setEditingSession(null);
    }
  };

  // ---------- Session handlers ----------
  const addSession = (values) => {
    setSessions([...sessions, { id: Date.now(), done: false, ...values }]);
  };

  const updateSession = (values) => {
    setSessions(
      sessions.map((s) => (s.id === editingSession.id ? { ...s, ...values } : s))
    );
    setEditingSession(null);
  };

  const handleSessionSubmit = (values) => {
    if (editingSession) {
      updateSession(values);
    } else {
      addSession(values);
    }
  };

  const toggleSession = (id) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  const deleteSession = (id) => {
    if (!window.confirm("Delete this study session?")) return;
    setSessions(sessions.filter((s) => s.id !== id));
    if (editingSession && editingSession.id === id) {
      setEditingSession(null);
    }
  };

  const startEditing = (session) => {
    setEditingSession(session);
    setPrefill((previous) => ({ ...previous, date: null })); // forget any calendar prefill
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Bundle the session handlers so we can pass them down easily
  const sessionActions = {
    onToggle: toggleSession,
    onEdit: startEditing,
    onDelete: deleteSession,
  };

  // ---------- Timetable navigation ----------
  const shiftSchedule = (direction) => {
    const step = view === "Weekly" ? 7 : 1;
    const next = addDays(parseLocalDate(selectedDate), step * direction);
    setSelectedDate(toDateString(next));
  };

  const goToToday = () => setSelectedDate(toDateString(new Date()));

  // Clicking a day header in the weekly view opens that day
  const openDay = (dateString) => {
    setSelectedDate(dateString);
    setView("Daily");
  };

  // ---------- Calendar navigation ----------
  const shiftMonth = (direction) => {
    setCalendarMonth(
      (month) => new Date(month.getFullYear(), month.getMonth() + direction, 1)
    );
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setCalendarMonth(firstOfMonth(now));
    setCalendarDate(toDateString(now));
  };

  // "Add session" in the calendar: open the form with that date filled in
  const addSessionOnDate = (dateString) => {
    setEditingSession(null);
    setPrefill((previous) => ({ date: dateString, nonce: previous.nonce + 1 }));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ---------- Derived data ----------
  const getSubject = (id) => subjects.find((s) => s.id === id) || FALLBACK_SUBJECT;

  // All sessions sorted by date, then start time
  const sortedSessions = [...sessions].sort((a, b) =>
    (a.date + a.startTime).localeCompare(b.date + b.startTime)
  );

  const todayString = toDateString(new Date());
  const todaySessions = sortedSessions.filter((s) => s.date === todayString);
  const todayDone = todaySessions.filter((s) => s.done).length;
  const todayMinutes = todaySessions.reduce(
    (sum, s) => sum + (timeToMinutes(s.endTime) - timeToMinutes(s.startTime)),
    0
  );

  const selectedDateObj = parseLocalDate(selectedDate);
  const weekStart = getWeekStart(selectedDateObj);
  const weekEnd = addDays(weekStart, 6);
  const selectedDaySessions = sortedSessions.filter((s) => s.date === selectedDate);

  const rangeLabel =
    view === "Weekly"
      ? `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : selectedDateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });

  return (
    <div className="sp-page">
      <div className="sp-heading">
        <h2>Study Planner</h2>
        <p>Organise your subjects and schedule focused study sessions.</p>
      </div>

      {/* Today's numbers (reuses StatCard) */}
      <div className="sp-stats">
        <StatCard
          icon={CalendarDays}
          title="Sessions Today"
          value={todaySessions.length}
          subtitle="Scheduled for today"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed Today"
          value={`${todayDone}/${todaySessions.length}`}
          subtitle="Sessions finished"
        />
        <StatCard
          icon={Clock}
          title="Planned Time"
          value={formatDuration(todayMinutes)}
          subtitle="Study time today"
        />
      </div>

      {/* Today's sessions */}
      <section className="sp-card">
        <h3 className="sp-card-title">Today's Study Sessions</h3>
        {todaySessions.length === 0 ? (
          <div className="sp-empty">
            <CalendarX2 size={42} />
            <h4>Nothing scheduled for today</h4>
            <p>Use the form below to schedule a study session.</p>
          </div>
        ) : (
          <ul className="sp-list">
            {todaySessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                subject={getSubject(session.subjectId)}
                {...sessionActions}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Subjects + session form */}
      <div className="sp-two-col">
        <SubjectManager
          subjects={subjects}
          onAdd={addSubject}
          onUpdate={updateSubject}
          onDelete={deleteSubject}
        />

        <div ref={formRef}>
          {/* The key resets the form when switching between add / edit,
              or when the calendar asks for a new date */}
          <SessionForm
            key={editingSession ? editingSession.id : `new-${prefill.nonce}`}
            subjects={subjects}
            initialSession={editingSession}
            defaultDate={prefill.date || selectedDate}
            onSubmit={handleSessionSubmit}
            onCancel={() => setEditingSession(null)}
          />
        </div>
      </div>

      {/* Timetable / Calendar */}
      <section className="sp-card">
        <div className="cv-switch" role="group" aria-label="Schedule layout">
          <button
            className={`cv-switch-btn ${layout === "Timetable" ? "active" : ""}`}
            aria-pressed={layout === "Timetable"}
            onClick={() => setLayout("Timetable")}
          >
            <LayoutGrid size={17} />
            Timetable View
          </button>
          <button
            className={`cv-switch-btn ${layout === "Calendar" ? "active" : ""}`}
            aria-pressed={layout === "Calendar"}
            onClick={() => setLayout("Calendar")}
          >
            <CalendarDays size={17} />
            Calendar View
          </button>
        </div>

        {layout === "Timetable" ? (
          <>
            {/* ----- Existing timetable (unchanged) ----- */}
            <div className="sp-schedule-top">
              <div className="sp-toggle">
                {VIEWS.map((name) => (
                  <button
                    key={name}
                    className={`sp-toggle-btn ${view === name ? "active" : ""}`}
                    onClick={() => setView(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="sp-nav">
                <button
                  className="sp-nav-btn"
                  onClick={() => shiftSchedule(-1)}
                  aria-label={view === "Weekly" ? "Previous week" : "Previous day"}
                >
                  <ChevronLeft size={18} />
                </button>
                <button className="sp-today-btn" onClick={goToToday}>
                  Today
                </button>
                <button
                  className="sp-nav-btn"
                  onClick={() => shiftSchedule(1)}
                  aria-label={view === "Weekly" ? "Next week" : "Next day"}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <h3 className="sp-range">{rangeLabel}</h3>

            {view === "Weekly" ? (
              <WeeklyTimetable
                weekStart={weekStart}
                sessions={sortedSessions}
                getSubject={getSubject}
                onSelectDay={openDay}
                {...sessionActions}
              />
            ) : (
              <DailySchedule
                sessions={selectedDaySessions}
                getSubject={getSubject}
                {...sessionActions}
              />
            )}
          </>
        ) : (
          <CalendarView
            month={calendarMonth}
            selectedDate={calendarDate}
            sessions={sortedSessions}
            getSubject={getSubject}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
            onToday={goToCurrentMonth}
            onSelectDate={setCalendarDate}
            onAddSession={addSessionOnDate}
            {...sessionActions}
          />
        )}
      </section>
    </div>
  );
}

export default StudyPlanner;