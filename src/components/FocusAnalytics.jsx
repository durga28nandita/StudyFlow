import { Timer, Clock, Hourglass } from "lucide-react";
import MiniStat from "./MiniStat";
import { formatDuration } from "../utils/dateUtils";

// `sessions` are the completed focus sessions already filtered to the chosen period.
// `periodText` is a phrase like "this week", used in the messages.
function FocusAnalytics({ sessions, periodText }) {
  const count = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const averageMinutes = count ? Math.round(totalMinutes / count) : 0;

  return (
    <section className="an-card">
      <h3 className="an-card-title">Focus Analytics</h3>
      <p className="an-card-sub">Completed sessions from the Focus Timer</p>

      {count === 0 ? (
        <div className="an-empty">
          <Timer size={40} />
          <h4>No focus sessions {periodText}</h4>
          <p>Finish a full focus session in the Focus Timer to see it here.</p>
        </div>
      ) : (
        <div className="an-mini-grid">
          <MiniStat icon={Timer} label="Completed sessions" value={count} />
          <MiniStat
            icon={Clock}
            label="Total focus time"
            value={formatDuration(totalMinutes)}
            tone="good"
          />
          <MiniStat
            icon={Hourglass}
            label="Average session"
            value={formatDuration(averageMinutes)}
          />
        </div>
      )}
    </section>
  );
}

export default FocusAnalytics;