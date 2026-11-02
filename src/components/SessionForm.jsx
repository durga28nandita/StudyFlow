import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import "../styles/SessionForm.css";

// Used for both adding (initialSession = null) and editing
function SessionForm({ subjects, initialSession, defaultDate, onSubmit, onCancel }) {
  const isEditing = Boolean(initialSession);

  const [subjectId, setSubjectId] = useState(
    initialSession?.subjectId ?? subjects[0]?.id ?? ""
  );
  const [topic, setTopic] = useState(initialSession?.topic || "");
  const [date, setDate] = useState(initialSession?.date || defaultDate);
  const [startTime, setStartTime] = useState(initialSession?.startTime || "09:00");
  const [endTime, setEndTime] = useState(initialSession?.endTime || "10:00");
  const [error, setError] = useState("");

  // If the chosen subject was deleted while the form was open, fall back safely
  const activeSubjectId = subjects.some((s) => s.id === subjectId)
    ? subjectId
    : subjects[0]?.id ?? "";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!activeSubjectId) {
      setError("Please add a subject first.");
      return;
    }
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    if (!date || !startTime || !endTime) {
      setError("Please fill in the date and both times.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after the start time.");
      return;
    }

    onSubmit({
      subjectId: activeSubjectId,
      topic: topic.trim(),
      date,
      startTime,
      endTime,
    });

    // After adding, clear only the topic so you can quickly add more sessions
    if (!isEditing) {
      setTopic("");
      setError("");
    }
  };

  return (
    <section className="sp-card">
      <h3 className="sp-card-title">
        {isEditing ? "Edit Study Session" : "Schedule a Study Session"}
      </h3>

      {subjects.length === 0 && (
        <p className="sf-notice">Add at least one subject before scheduling sessions.</p>
      )}

      <form className="sf-form" onSubmit={handleSubmit}>
        <div className="sf-field">
          <label htmlFor="session-subject">Subject</label>
          <select
            id="session-subject"
            value={activeSubjectId}
            disabled={subjects.length === 0}
            onChange={(e) => {
              setSubjectId(Number(e.target.value));
              setError("");
            }}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sf-field">
          <label htmlFor="session-topic">Topic</label>
          <input
            id="session-topic"
            type="text"
            placeholder="e.g. Chapter 4 practice"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="sf-field sf-full">
          <label htmlFor="session-date">Date</label>
          <input
            id="session-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="sf-field">
          <label htmlFor="session-start">Start time</label>
          <input
            id="session-start"
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="sf-field">
          <label htmlFor="session-end">End time</label>
          <input
            id="session-end"
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && <span className="sf-error sf-full">{error}</span>}

        <div className="sf-actions sf-full">
          <button
            type="submit"
            className="sf-btn primary"
            disabled={subjects.length === 0}
          >
            {isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? "Save Changes" : "Add Session"}
          </button>

          {isEditing && (
            <button type="button" className="sf-btn secondary" onClick={onCancel}>
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default SessionForm;