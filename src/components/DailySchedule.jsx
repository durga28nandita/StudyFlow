import { CalendarX2 } from "lucide-react";
import SessionCard from "./SessionCard";

// `sessions` must already be filtered to the selected day and sorted by time
function DailySchedule({ sessions, getSubject, onToggle, onEdit, onDelete }) {
  if (sessions.length === 0) {
    return (
      <div className="sp-empty">
        <CalendarX2 size={42} />
        <h4>No sessions on this day</h4>
        <p>Enjoy the free time, or schedule a new session above.</p>
      </div>
    );
  }

  const doneCount = sessions.filter((s) => s.done).length;

  return (
    <>
      <p className="sp-daily-summary">
        {doneCount} of {sessions.length} session{sessions.length === 1 ? "" : "s"} completed
      </p>
      <ul className="sp-list">
        {sessions.map((session) => (
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
    </>
  );
}

export default DailySchedule;