import { useState, useEffect } from "react";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import StatCard from "../components/StatCard";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";
import { loadData, saveData } from "../utils/storage";
import { toDateString } from "../utils/dateUtils";
import "../styles/Tasks.css";

// Same key the Dashboard uses, so both pages share the same tasks
const STORAGE_KEY = "studyflow-tasks";
const FILTERS = ["All", "Pending", "Completed"];

// Messages shown when a filter has no matching tasks
const filterEmptyMessages = {
  Pending: {
    title: "No pending tasks",
    text: "You're all caught up. Nice work!",
  },
  Completed: {
    title: "No completed tasks yet",
    text: "Tick a task off and it will show up here.",
  },
};

function Tasks() {
  const [tasks, setTasks] = useState(() => loadData(STORAGE_KEY, []));
  const [filter, setFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null); // null = adding a new task

  // Save to LocalStorage whenever tasks change
  useEffect(() => {
    saveData(STORAGE_KEY, tasks);
  }, [tasks]);

  // ---------- Handlers ----------
  const addTask = (values) => {
    const newTask = { id: Date.now(), done: false, ...values };
    setTasks([newTask, ...tasks]); // newest task goes to the top
  };

  const updateTask = (values) => {
    setTasks(
      tasks.map((t) => (t.id === editingTask.id ? { ...t, ...values } : t))
    );
    setEditingTask(null);
  };

  const handleFormSubmit = (values) => {
    if (editingTask) {
      updateTask(values);
    } else {
      addTask(values);
    }
  };

  // Ticking a task records the day it was completed (used by Daily Goals).
  // Unticking clears it.
  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              completedOn: !t.done ? toDateString(new Date()) : null,
            }
          : t
      )
    );
  };

  const deleteTask = (id) => {
    if (!window.confirm("Delete this task?")) return;
    setTasks(tasks.filter((t) => t.id !== id));
    // If we were editing the task we just deleted, close the edit form
    if (editingTask && editingTask.id === id) {
      setEditingTask(null);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: "smooth" }); // bring the form into view
  };

  // ---------- Derived data ----------
  const completedCount = tasks.filter((t) => t.done).length;
  const pendingCount = tasks.length - completedCount;
  const counts = {
    All: tasks.length,
    Pending: pendingCount,
    Completed: completedCount,
  };

  const visibleTasks = tasks
    .filter((t) => {
      if (filter === "Pending") return !t.done;
      if (filter === "Completed") return t.done;
      return true;
    })
    // Pending tasks first, completed ones sink to the bottom
    .sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="tasks-page">
      <div className="tm-heading">
        <h2>Task Manager</h2>
        <p>Plan, track and complete your study tasks.</p>
      </div>

      {/* Task counts (reuses the StatCard component) */}
      <div className="tm-stats">
        <StatCard
          icon={ClipboardList}
          title="Total Tasks"
          value={tasks.length}
          subtitle="All your tasks"
        />
        <StatCard
          icon={Clock}
          title="Pending"
          value={pendingCount}
          subtitle="Still to do"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={completedCount}
          subtitle="Well done!"
        />
      </div>

      {/* The key makes the form reset whenever we switch between add / edit */}
      <TaskForm
        key={editingTask ? editingTask.id : "new"}
        initialTask={editingTask}
        onSubmit={handleFormSubmit}
        onCancel={() => setEditingTask(null)}
      />

      <section className="tm-card">
        <div className="tm-list-header">
          <h3 className="tm-card-title">Your Tasks</h3>

          <div className="tm-filters">
            {FILTERS.map((name) => (
              <button
                key={name}
                className={`tm-filter ${filter === name ? "active" : ""}`}
                onClick={() => setFilter(name)}
              >
                {name}
                <span className="tm-filter-count">{counts[name]}</span>
              </button>
            ))}
          </div>
        </div>

        {tasks.length === 0 ? (
          // Empty state: no tasks at all
          <div className="tm-empty">
            <ClipboardList size={42} />
            <h4>No tasks yet</h4>
            <p>Add your first task above to get started.</p>
          </div>
        ) : visibleTasks.length === 0 ? (
          // Empty state: tasks exist, but none match this filter
          <div className="tm-empty">
            <ClipboardList size={42} />
            <h4>{filterEmptyMessages[filter].title}</h4>
            <p>{filterEmptyMessages[filter].text}</p>
          </div>
        ) : (
          <ul className="tm-list">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isBeingEdited={editingTask?.id === task.id}
                onToggle={toggleTask}
                onEdit={startEditing}
                onDelete={deleteTask}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Tasks;