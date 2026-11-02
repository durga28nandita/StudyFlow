import { Clock, CalendarDays, Pencil, Trash2, StickyNote } from "lucide-react";
import { toDateString, parseLocalDate, formatDuration } from "../utils/dateUtils";
import "../styles/StudyLogItem.css";

function formatLogDate(dateString) {
  if (dateString === toDateString(new Date())) return "Today";
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// One row in the history list. `subject` is { name, color }.
function StudyLogItem({ log, subject, isBeingEdited, onEdit, onDelete }) {
  return (
    <li
      className={`lg-item ${isBeingEdited ? "editing" : ""}`}
      style={{ "--subject-color": subject.color }}
    >
      <div className="lg-body">
        <p className="lg-topic">{log.topic}</p>

        <div className="lg-meta">
          <span className="lg-subject">{subject.name}</span>
          <span className="lg-chip">
            <CalendarDays size={13} />
            {formatLogDate(log.date)}
          </span>
          <span className="lg-chip">
            <Clock size={13} />
            {formatDuration(log.minutes)}
          </span>
        </div>

        {log.notes && (
          <p className="lg-notes">
            <StickyNote size={13} />
            <span>{log.notes}</span>
          </p>
        )}
      </div>

      <div className="lg-actions">
        <button
          className="lg-icon-btn"
          onClick={() => onEdit(log)}
          aria-label={`Edit "${log.topic}"`}
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          className="lg-icon-btn danger"
          onClick={() => onDelete(log.id)}
          aria-label={`Delete "${log.topic}"`}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}

export default StudyLogItem;