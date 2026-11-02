import { useState } from "react";
import { Save } from "lucide-react";
import "../styles/TimerSettings.css";

// Lets the user change focus and break lengths (in minutes)
function TimerSettings({ settings, disabled, onSave }) {
  // Inputs are kept as strings while typing
  const [focus, setFocus] = useState(String(settings.focusMinutes));
  const [rest, setRest] = useState(String(settings.breakMinutes));
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const focusMinutes = Number(focus);
    const breakMinutes = Number(rest);

    if (!Number.isInteger(focusMinutes) || focusMinutes < 1 || focusMinutes > 120) {
      setError("Focus time must be a whole number from 1 to 120 minutes.");
      return;
    }
    if (!Number.isInteger(breakMinutes) || breakMinutes < 1 || breakMinutes > 60) {
      setError("Break time must be a whole number from 1 to 60 minutes.");
      return;
    }

    setError("");
    onSave({ focusMinutes, breakMinutes });
  };

  return (
    <section className="ft-card">
      <h3 className="ft-card-title">Timer Settings</h3>

      <form className="ts-form" onSubmit={handleSubmit}>
        <div className="ts-field">
          <label htmlFor="focus-minutes">Focus (minutes)</label>
          <input
            id="focus-minutes"
            type="number"
            min="1"
            max="120"
            value={focus}
            disabled={disabled}
            onChange={(e) => {
              setFocus(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="ts-field">
          <label htmlFor="break-minutes">Break (minutes)</label>
          <input
            id="break-minutes"
            type="number"
            min="1"
            max="60"
            value={rest}
            disabled={disabled}
            onChange={(e) => {
              setRest(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && <span className="ts-error">{error}</span>}
        {disabled && (
          <span className="ts-note">Reset the timer to change the durations.</span>
        )}

        <button type="submit" className="ts-btn" disabled={disabled}>
          <Save size={18} />
          Save Durations
        </button>
      </form>
    </section>
  );
}

export default TimerSettings;