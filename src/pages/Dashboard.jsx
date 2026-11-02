import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Flame,
  CalendarDays,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../components/StatCard";
import DailyGoals from "../components/DailyGoals";
import { loadData, saveData } from "../utils/storage";
import { toDateString } from "../utils/dateUtils";
import "../styles/Dashboard.css";

// ---------- Sample data ----------
const sampleTasks = [
  { id: 1, title: "Finish calculus problem set", subject: "Math", done: true },
  { id: 2, title: "Read chapter 5 of Biology", subject: "Biology", done: false },
  { id: 3, title: "Write essay outline", subject: "English", done: false },
  { id: 4, title: "Review physics lecture notes", subject: "Physics", done: false },
  { id: 5, title: "Practice Spanish vocabulary", subject: "Spanish", done: true },
];

const weeklyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 4 },
  { day: "Fri", hours: 2 },
  { day: "Sat", hours: 3.5 },
  { day: "Sun", hours: 1 },
];

const deadlines = [
  { id: 1, title: "Physics Lab Report", date: "Nov 5", daysLeft: 3 },
  { id: 2, title: "History Presentation", date: "Nov 8", daysLeft: 6 },
  { id: 3, title: "Math Midterm", date: "Nov 12", daysLeft: 10 },
  { id: 4, title: "English Essay Draft", date: "Nov 15", daysLeft: 13 },
];

// ---------- Small helper components ----------
function TodaysTasks({ tasks, onToggle }) {
  return (
    <section className="panel">
      <h2 className="panel-title">Today's Tasks</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${task.done ? "done" : ""}`}
          >
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => onToggle(task.id)}
              />
              <span className="task-title">{task.title}</span>
            </label>
            <span className="task-tag">{task.subject}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WeeklyChart({ data }) {
  return (
    <section className="panel">
      <h2 className="panel-title">Weekly Study Activity</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2547" vertical={false} />
            <XAxis dataKey="day" stroke="#9b94b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#9b94b8" tickLine={false} axisLine={false} unit="h" />
            <Tooltip
              cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
              contentStyle={{
                background: "#1c1730",
                border: "1px solid #8b5cf6",
                borderRadius: "10px",
                color: "#f3f0ff",
              }}
            />
            <Bar dataKey="hours" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function UpcomingDeadlines({ items }) {
  return (
    <section className="panel">
      <h2 className="panel-title">Upcoming Deadlines</h2>
      <ul className="deadline-list">
        {items.map((item) => (
          <li key={item.id} className="deadline-item">
            <div className="deadline-icon">
              <CalendarDays size={18} />
            </div>
            <div className="deadline-info">
              <p className="deadline-title">{item.title}</p>
              <p className="deadline-date">{item.date}</p>
            </div>
            <span className={`deadline-badge ${item.daysLeft <= 3 ? "urgent" : ""}`}>
              {item.daysLeft} days
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Main page ----------
function Dashboard() {
  // Load tasks from LocalStorage, or use sample tasks the first time
  const [tasks, setTasks] = useState(() => loadData("studyflow-tasks", sampleTasks));

  // Save tasks whenever they change
  useEffect(() => {
    saveData("studyflow-tasks", tasks);
  }, [tasks]);

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

  // Calculated stats
  const completed = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const totalHours = weeklyData.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard
          icon={CheckCircle2}
          title="Tasks Completed"
          value={`${completed}/${tasks.length}`}
          subtitle="Keep it up!"
        />
        <StatCard
          icon={Clock}
          title="Study Hours"
          value={`${totalHours}h`}
          subtitle="This week"
        />
        <StatCard
          icon={TrendingUp}
          title="Daily Progress"
          value={`${progress}%`}
          subtitle="Of today's tasks"
        />
        <StatCard
          icon={Flame}
          title="Current Streak"
          value="7 days"
          subtitle="Personal best: 12"
        />
      </div>

      <DailyGoals tasks={tasks} />

      <div className="dashboard-grid">
        <TodaysTasks tasks={tasks} onToggle={toggleTask} />
        <UpcomingDeadlines items={deadlines} />
        <div className="chart-span">
          <WeeklyChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;