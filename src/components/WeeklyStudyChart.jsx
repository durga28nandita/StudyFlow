import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatDuration } from "../utils/dateUtils";

// `data` is 7 items (Mon to Sun): { day, minutes, hours, isToday }
function WeeklyStudyChart({ data }) {
  const hasData = data.some((d) => d.minutes > 0);

  return (
    <section className="an-card">
      <h3 className="an-card-title">Daily Study Time</h3>
      <p className="an-card-sub">Current week, Monday to Sunday</p>

      {!hasData ? (
        <div className="an-empty">
          <BarChart3 size={40} />
          <h4>No study time logged this week</h4>
          <p>Add a log in the Study Tracker and your daily bars will appear here.</p>
        </div>
      ) : (
        <div className="an-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2547" vertical={false} />
              <XAxis dataKey="day" stroke="#9b94b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#9b94b8" tickLine={false} axisLine={false} unit="h" />
              <Tooltip
                cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                formatter={(value, name, item) => [
                  formatDuration(item.payload.minutes),
                  "Study time",
                ]}
                contentStyle={{
                  background: "#1c1730",
                  border: "1px solid #8b5cf6",
                  borderRadius: "10px",
                  color: "#f3f0ff",
                }}
                labelStyle={{ color: "#f3f0ff" }}
                itemStyle={{ color: "#f3f0ff" }}
              />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                {/* Today's bar is lavender, the others are violet */}
                {data.map((item) => (
                  <Cell key={item.day} fill={item.isToday ? "#a78bfa" : "#8b5cf6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default WeeklyStudyChart;