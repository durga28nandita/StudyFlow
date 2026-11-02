import { ChevronLeft, ChevronRight, Plus, CalendarX2 } from "lucide-react";
import SessionCard from "./SessionCard";
import {
  toDateString,
  parseLocalDate,
  addDays,
  getWeekStart,
  formatTime,
  formatDuration,
  timeToMinutes,
} from "../utils/dateUtils";
import "../styles/CalendarView.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_CHIPS = 2; // sessions shown as text inside a date (the rest show "+N more")
const MAX_DOTS = 4; // dots shown on small screens

// A month grid built from the Study Planner's existing sessions.
// `month` is the first day of the month being shown.
// `sessions` must already be sorted by date and start time.
function CalendarView({
  month,
  selectedDate,
  sessions,
  getSubject,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate,
  onAddSession,
  onToggle,
  onEdit,
  onDelete,
}) {
  const todayString = toDateString(new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // ---------- Build the grid (weeks start on Monday) ----------
  const leadingDays = (month.getDay() + 6) % 7; // days from the previous month
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const gridStart = getWeekStart(month);
  const cells = Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i));

  // ---------- Group sessions by date: { "2025-11-05": [session, ...] } ----------
  const sessionsByDate = {};
  sessions.forEach((session) => {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  });

  // ---------- Selected day ----------
  const selectedSessions = sessionsByDate[selectedDate] || [];
  const selectedDone = selectedSessions.filter((s) => s.done).length;
  const selectedMinutes = selectedSessions.reduce(
    (sum, s) => sum + (timeToMinutes(s.endTime) - timeToMinutes(s.startTime)),
    0
  );

  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedLabel = parseLocalDate(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="cv">
      {/* ----- Month navigation (reuses the planner's button styles) ----- */}
      <div className="cv-toolbar">
        <h3 className="cv-month">{monthLabel}</h3>

        <div className="sp-nav">
          <button className="sp-nav-btn" onClick={onPrevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button className="sp-today-btn" onClick={onToday}>
            Today
          </button>
          <button className="sp-nav-btn" onClick={onNextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ----- Month grid ----- */}
      <div className="cv-weekdays">
        {WEEKDAYS.map((name) => (
          <span key={name} className="cv-weekday">
            {name}
          </span>
        ))}
      </div>

      <div className="cv-grid">
        {cells.map((day) => {
          const dateString = toDateString(day);
          const daySessions = sessionsByDate[dateString] || [];
          const isToday = dateString === todayString;
          const isSelected = dateString === selectedDate;
          const isOutside = day.getMonth() !== monthIndex;
          const hiddenCount = daySessions.length - MAX_CHIPS;

          const label = `${day.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}, ${daySessions.length} session${daySessions.length === 1 ? "" : "s"}`;

          return (
            <button
              key={dateString}
              type="button"
              className={`cv-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${isOutside ? "outside" : ""}`}
              onClick={() => onSelectDate(dateString)}
              aria-label={label}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
            >
              <span className="cv-num">{day.getDate()}</span>

              {daySessions.length > 0 && (
                <>
                  {/* Large screens: subject name + start time */}
                  <span className="cv-chips">
                    {daySessions.slice(0, MAX_CHIPS).map((session) => {
                      const subject = getSubject(session.subjectId);
                      return (
                        <span
                          key={session.id}
                          className={`cv-chip ${session.done ? "done" : ""}`}
                          style={{ "--subject-color": subject.color }}
                          title={`${subject.name}: ${session.topic} (${formatTime(session.startTime)} – ${formatTime(session.endTime)})`}
                        >
                          <span className="cv-chip-time">{formatTime(session.startTime)}</span>
                          <span className="cv-chip-name">{subject.name}</span>
                        </span>
                      );
                    })}
                    {hiddenCount > 0 && <span className="cv-more">+{hiddenCount} more</span>}
                  </span>

                  {/* Small screens: coloured dots (details show in the panel below) */}
                  <span className="cv-dots" aria-hidden="true">
                    {daySessions.slice(0, MAX_DOTS).map((session) => (
                      <span
                        key={session.id}
                        className="cv-dot"
                        style={{ "--subject-color": getSubject(session.subjectId).color }}
                      />
                    ))}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* ----- Sessions for the selected date ----- */}
      <div className="cv-day-panel">
        <div className="cv-day-head">
          <div>
            <h4 className="cv-day-title">{selectedLabel}</h4>
            <p className="cv-day-sub">
              {selectedSessions.length === 0
                ? "Nothing scheduled"
                : `${selectedDone} of ${selectedSessions.length} completed · ${formatDuration(selectedMinutes)} planned`}
            </p>
          </div>

          <button className="cv-add-btn" onClick={() => onAddSession(selectedDate)}>
            <Plus size={16} />
            Add session
          </button>
        </div>

        {selectedSessions.length === 0 ? (
          <div className="sp-empty small">
            <CalendarX2 size={36} />
            <h4>No sessions on this day</h4>
            <p>Click "Add session" to schedule one for this date.</p>
          </div>
        ) : (
          <ul className="sp-list">
            {selectedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                subject={getSubject(session.subjectId)}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CalendarView;