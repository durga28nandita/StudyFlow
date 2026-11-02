import { Clock, Pencil, Trash2 } from "lucide-react";
import { formatTime, formatDuration, timeToMinutes } from "../utils/dateUtils";
import "../styles/SessionCard.css";

// One study session. `compact` makes it smaller for the weekly timetable.
function SessionCard({ session, subject, compact = false, onToggle, onEdit, onDelete }) {
  const minutes = timeToMinutes(session.endTime) - timeToMinutes(session.startTime);

  return (
    <li
      className={`sc-card ${compact ? "compact" : ""} ${session.done ? "done" : ""}`}
      style={{ "--subject-color": subject.color }}
    >
      <input
        type="checkbox"
        className="sc-check"
        checked={session.done}
        onChange={() => onToggle(session.id)}
        aria-label={`Mark "${session.topic}" as completed`}
      />

      <div className="sc-body">
        <p className="sc-subject">{subject.name}</p>
        <p className="sc-topic">{session.topic}</p>
        <p className="sc-time">
          <Clock size={13} />
          {formatTime(session.startTime)} – {formatTime(session.endTime)}
          {!compact && <span className="sc-duration">· {formatDuration(minutes)}</span>}
        </p>
      </div>

      <div className="sc-actions">
        <button
          className="sc-icon-btn"
          onClick={() => onEdit(session)}
          aria-label={`Edit "${session.topic}"`}
          title="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          className="sc-icon-btn danger"
          onClick={() => onDelete(session.id)}
          aria-label={`Delete "${session.topic}"`}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

export default SessionCard;