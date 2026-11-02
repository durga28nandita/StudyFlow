import { Pencil, Trash2, CalendarDays } from "lucide-react";
import "../styles/TaskItem.css";

// "2025-11-05" -> local Date (avoids the timezone off-by-one bug of new Date("2025-11-05"))
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDueDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// A task is overdue if it is not done and its due date is before today
function isOverdue(task) {
  if (!task.dueDate || task.done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(task.dueDate) < today;
}

function TaskItem({ task, isBeingEdited, onToggle, onEdit, onDelete }) {
  // Older sample tasks may not have these fields yet
  const priority = task.priority || "Medium";
  const subject = task.subject || "General";
  const overdue = isOverdue(task);

  return (
    <li
      className={`tm-item priority-${priority.toLowerCase()} ${
        task.done ? "done" : ""
      } ${isBeingEdited ? "editing" : ""}`}
    >
      <input
        type="checkbox"
        className="tm-check"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as completed`}
      />

      <div className="tm-body">
        <p className="tm-title">{task.title}</p>

        <div className="tm-meta">
          <span className="tm-subject">{subject}</span>

          {task.dueDate && (
            <span className={`tm-due ${overdue ? "overdue" : ""}`}>
              <CalendarDays size={14} />
              {overdue ? "Overdue · " : ""}
              {formatDueDate(task.dueDate)}
            </span>
          )}

          <span className={`tm-priority ${priority.toLowerCase()}`}>
            {priority}
          </span>
        </div>
      </div>

      <div className="tm-actions">
        <button
          className="tm-icon-btn"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          title="Edit"
        >
          <Pencil size={17} />
        </button>
        <button
          className="tm-icon-btn danger"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          title="Delete"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </li>
  );
}

export default TaskItem;