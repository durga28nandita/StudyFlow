import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { toDateString } from "../utils/dateUtils";
import "../styles/StudyLogForm.css";

// Used for both adding (initialLog = null) and editing
function StudyLogForm({ subjects, initialLog, onSubmit, onCancel }) {
  const isEditing = Boolean(initialLog);
  const today = toDateString(new Date());

  const [subjectId, setSubjectId] = useState(() => {
    if (initialLog) {
      // If the log's subject was deleted in the planner, ask for a new one
      const stillExists = subjects.some((s) => s.id === initialLog.subjectId);
      return stillExists ? initialLog.subjectId : "";
    }
    return subjects[0]?.id ?? "";
  });
  const [topic, setTopic] = useState(initialLog?.topic || "");
  const [date, setDate] = useState(initialLog?.date || today);
  // Inputs are kept as strings while typing
  const [hours, setHours] = useState(
    initialLog ? String(Math.floor(initialLog.minutes / 60)) : "1"
  );
  const [minutes, setMinutes] = useState(
    initialLog ? String(initialLog.minutes % 60) : "0"
  );
  const [notes, setNotes] = useState(initialLog?.notes || "");
  const [error, setError] = useState("");

  const clearError = () => setError("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) {
      setError("Please choose a subject.");
      return;
    }
    if (!topic.trim()) {
      setError("Please enter the topic you studied.");
      return;
    }
    if (!date) {
      setError("Please choose a date.");
      return;
    }
    if (date > today) {
      setError("The date can't be in the future.");
      return;
    }

    const h = Number(hours); // an empty box becomes 0
    const m = Number(minutes);
    if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 24 || m < 0 || m > 59) {
      setError("Hours must be 0 to 24 and minutes 0 to 59.");
      return;
    }

    const totalMinutes = h * 60 + m;
    if (totalMinutes <= 0) {
      setError("Please enter a duration longer than 0.");
      return;
    }
    if (totalMinutes > 24 * 60) {
      setError("A single log can't be longer than 24 hours.");
      return;
    }

    onSubmit({
      subjectId: subject.id,
      subjectName: subject.name, // saved in case the subject is deleted later
      topic: topic.trim(),
      date,
      minutes: totalMinutes,
      notes: notes.trim(),
    });

    // After adding, clear the form but keep the subject and date
    if (!isEditing) {
      setTopic("");
      setHours("1");
      setMinutes("0");
      setNotes("");
      setError("");
    }
  };

  return (
    <section className="st-card">
      <h3 className="st-card-title">
        {isEditing ? "Edit Study Log" : "Add a Study Log"}
      </h3>

      {subjects.length === 0 && (
        <p className="lf-notice">
          No subjects found. Create subjects in the Study Planner first.
        </p>
      )}

      <form className="lf-form" onSubmit={handleSubmit}>
        <div className="lf-field">
          <label htmlFor="log-subject">Subject</label>
          <select
            id="log-subject"
            value={subjectId}
            disabled={subjects.length === 0}
            onChange={(e) => {
              setSubjectId(Number(e.target.value));
              clearError();
            }}
          >
            {subjectId === "" && (
              <option value="" disabled>
                Choose a subject
              </option>
            )}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lf-field">
          <label htmlFor="log-date">Date</label>
          <input
            id="log-date"
            type="date"
            max={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              clearError();
            }}
          />
        </div>

        <div className="lf-field lf-full">
          <label htmlFor="log-topic">Topic studied</label>
          <input
            id="log-topic"
            type="text"
            placeholder="e.g. Chapter 4 practice questions"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              clearError();
            }}
          />
        </div>

        <div className="lf-field">
          <label htmlFor="log-hours">Hours</label>
          <input
            id="log-hours"
            type="number"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              clearError();
            }}
          />
        </div>

        <div className="lf-field">
          <label htmlFor="log-minutes">Minutes</label>
          <input
            id="log-minutes"
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => {
              setMinutes(e.target.value);
              clearError();
            }}
          />
        </div>

        <div className="lf-field lf-full">
          <label htmlFor="log-notes">Notes (optional)</label>
          <textarea
            id="log-notes"
            rows="3"
            maxLength="300"
            placeholder="Anything you want to remember..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <span className="lf-error lf-full">{error}</span>}

        <div className="lf-actions lf-full">
          <button
            type="submit"
            className="lf-btn primary"
            disabled={subjects.length === 0}
          >
            {isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? "Save Changes" : "Add Log"}
          </button>

          {isEditing && (
            <button type="button" className="lf-btn secondary" onClick={onCancel}>
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default StudyLogForm;