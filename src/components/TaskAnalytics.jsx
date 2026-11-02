import { ClipboardList, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import MiniStat from "./MiniStat";

// `tasks` is the full task list from the Task Manager.
// `today` is "YYYY-MM-DD", used to decide which tasks are overdue.
function TaskAnalytics({ tasks, today }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pending = total - completed;

  // Overdue = not finished AND has a due date that is before today
  const overdue = tasks.filter(
    (t) => !t.done && typeof t.dueDate === "string" && t.dueDate && t.dueDate < today
  ).length;

  const rate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="an-card">
      <h3 className="an-card-title">Task Analytics</h3>
      <p className="an-card-sub">All tasks (tasks don't record a completion date)</p>

      {total === 0 ? (
        <div className="an-empty">
          <ClipboardList size={40} />
          <h4>No tasks yet</h4>
          <p>Add tasks in the Task Manager to see your progress here.</p>
        </div>
      ) : (
        <>
          <div className="an-mini-grid">
            <MiniStat icon={ClipboardList} label="Total tasks" value={total} />
            <MiniStat icon={CheckCircle2} label="Completed" value={completed} tone="good" />
            <MiniStat icon={Clock} label="Pending" value={pending} tone="warn" />
            <MiniStat icon={AlertTriangle} label="Overdue" value={overdue} tone="danger" />
          </div>

          <div className="an-progress">
            <div className="an-progress-top">
              <span>Completion rate</span>
              <span>{rate}%</span>
            </div>
            <div className="an-progress-track">
              <div className="an-progress-fill" style={{ width: `${rate}%` }} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default TaskAnalytics;