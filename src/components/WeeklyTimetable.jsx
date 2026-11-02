import { CalendarX2 } from "lucide-react";
import SessionCard from "./SessionCard";
import { addDays, toDateString } from "../utils/dateUtils";
import "../styles/WeeklyTimetable.css";

function WeeklyTimetable({
  weekStart,
  sessions,
  getSubject,
  onSelectDay,
  onToggle,
  onEdit,
  onDelete,
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayStrings = days.map(toDateString);
  const todayString = toDateString(new Date());

  const weekHasSessions = sessions.some((s) => dayStrings.includes(s.date));

  // Empty state for the whole week
  if (!weekHasSessions) {
    return (
      <div className="sp-empty">
        <CalendarX2 size={42} />
        <h4>No sessions this week</h4>
        <p>Schedule a session using the form above and it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="wt-scroll">
      <div className="wt-grid">
        {days.map((day) => {
          const dateString = toDateString(day);
          // `sessions` is already sorted by date and start time
          const daySessions = sessions.filter((s) => s.date === dateString);
          const isToday = dateString === todayString;

          return (
            <div key={dateString} className={`wt-day ${isToday ? "today" : ""}`}>
              <button
                className="wt-day-header"
                onClick={() => onSelectDay(dateString)}
                title="Open daily schedule"
              >
                <span className="wt-day-name">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="wt-day-num">{day.getDate()}</span>
              </button>

              <ul className="wt-sessions">
                {daySessions.length === 0 ? (
                  <li className="wt-free">Free day</li>
                ) : (
                  daySessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      subject={getSubject(session.subjectId)}
                      compact
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyTimetable;