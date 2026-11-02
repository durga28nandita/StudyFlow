import { useState } from "react";
import { Plus, Save, X, Pencil, Trash2, BookOpen } from "lucide-react";
import "../styles/SubjectManager.css";

// 12 distinct colours that look good on the dark theme
const SUBJECT_COLORS = [
  "#8b5cf6", "#34d399", "#38bdf8", "#f472b6",
  "#fbbf24", "#fb923c", "#f87171", "#2dd4bf",
  "#a3e635", "#818cf8", "#e879f9", "#94a3b8",
];

function SubjectManager({ subjects, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null); // null = adding
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Colours already used by OTHER subjects can't be picked again
  const takenColors = subjects
    .filter((s) => s.id !== editingId)
    .map((s) => s.color);

  const firstFreeColor = (taken) =>
    SUBJECT_COLORS.find((c) => !taken.includes(c)) || "";

  const [color, setColor] = useState(() =>
    firstFreeColor(subjects.map((s) => s.color))
  );

  const resetForm = (taken) => {
    setEditingId(null);
    setName("");
    setColor(firstFreeColor(taken));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Please enter a subject name.");
      return;
    }
    if (!color) {
      setError("All colours are in use. Delete a subject or edit one first.");
      return;
    }
    const duplicate = subjects.some(
      (s) => s.id !== editingId && s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError("You already have a subject with that name.");
      return;
    }

    if (editingId) {
      onUpdate(editingId, { name: trimmed, color });
      resetForm(subjects.filter((s) => s.id !== editingId).map((s) => s.color).concat(color));
    } else {
      onAdd({ name: trimmed, color });
      resetForm([...subjects.map((s) => s.color), color]);
    }
  };

  const startEditing = (subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setColor(subject.color);
    setError("");
  };

  const handleDelete = (subject) => {
    onDelete(subject.id);
    // If we were editing the deleted subject, leave edit mode
    if (editingId === subject.id) {
      resetForm(subjects.filter((s) => s.id !== subject.id).map((s) => s.color));
    }
  };

  return (
    <section className="sp-card">
      <h3 className="sp-card-title">Subjects</h3>

      <form className="sm-form" onSubmit={handleSubmit}>
        <div className="sm-row">
          <input
            type="text"
            className="sm-input"
            placeholder="e.g. Chemistry"
            value={name}
            aria-label="Subject name"
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />
          <button type="submit" className="sm-btn primary">
            {editingId ? <Save size={18} /> : <Plus size={18} />}
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              className="sm-btn secondary"
              onClick={() => resetForm(subjects.map((s) => s.color))}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {error && <span className="sm-error">{error}</span>}

        <div className="sm-swatches" role="radiogroup" aria-label="Subject colour">
          {SUBJECT_COLORS.map((c) => {
            const taken = takenColors.includes(c);
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={`Colour ${c}${taken ? " (already used)" : ""}`}
                disabled={taken}
                className={`sm-swatch ${color === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => {
                  setColor(c);
                  setError("");
                }}
              />
            );
          })}
        </div>
      </form>

      {subjects.length === 0 ? (
        <div className="sp-empty small">
          <BookOpen size={34} />
          <h4>No subjects yet</h4>
          <p>Add a subject to start scheduling sessions.</p>
        </div>
      ) : (
        <ul className="sm-list">
          {subjects.map((subject) => (
            <li
              key={subject.id}
              className={`sm-item ${editingId === subject.id ? "editing" : ""}`}
            >
              <span className="sm-dot" style={{ background: subject.color }} />
              <span className="sm-name">{subject.name}</span>
              <button
                className="sm-icon-btn"
                onClick={() => startEditing(subject)}
                aria-label={`Edit ${subject.name}`}
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                className="sm-icon-btn danger"
                onClick={() => handleDelete(subject)}
                aria-label={`Delete ${subject.name}`}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SubjectManager;