import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import "../styles/TaskForm.css";

const PRIORITIES = ["Low", "Medium", "High"];

// Used for both adding (initialTask = null) and editing (initialTask = a task)
function TaskForm({ initialTask, onSubmit, onCancel }) {
  const isEditing = Boolean(initialTask);

  // Older sample tasks may not have a priority or due date, so we use defaults
  const [title, setTitle] = useState(initialTask?.title || "");
  const [subject, setSubject] = useState(initialTask?.subject || "");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || "");
  const [priority, setPriority] = useState(initialTask?.priority || "Medium");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    onSubmit({
      title: title.trim(),
      subject: subject.trim() || "General",
      dueDate,
      priority,
    });

    // Clear the form after adding (when editing, the parent resets the form)
    if (!isEditing) {
      setTitle("");
      setSubject("");
      setDueDate("");
      setPriority("Medium");
      setError("");
    }
  };

  return (
    <section className="tm-card tf-card">
      <h3 className="tm-card-title">{isEditing ? "Edit Task" : "Add a New Task"}</h3>

      <form className="tf-form" onSubmit={handleSubmit}>
        <div className="tf-field tf-full">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            type="text"
            placeholder="e.g. Finish chapter 4 summary"
            value={title}
            autoFocus={isEditing}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
          />
          {error && <span className="tf-error">{error}</span>}
        </div>

        <div className="tf-field">
          <label htmlFor="task-subject">Subject</label>
          <input
            id="task-subject"
            type="text"
            placeholder="e.g. Math"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="tf-field">
          <label htmlFor="task-due">Due date</label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="tf-field">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="tf-actions tf-full">
          <button type="submit" className="tf-btn primary">
            {isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? "Save Changes" : "Add Task"}
          </button>

          {isEditing && (
            <button type="button" className="tf-btn secondary" onClick={onCancel}>
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default TaskForm;