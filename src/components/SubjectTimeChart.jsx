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

// Long subject names are shortened so the labels don't overlap
function shortName(name) {
  return name.length > 9 ? `${name.slice(0, 8)}…` : name;
}

// `data` is a list of { name, color, minutes } (only subjects with time logged)
function SubjectTimeChart({ data }) {
  // The chart axis shows hours
  const chartData = data.map((item) => ({
    ...item,
    hours: Math.round((item.minutes / 60) * 100) / 100,
  }));

  return (
    <section className="st-card">
      <h3 className="st-card-title">Study Time by Subject</h3>

      {chartData.length === 0 ? (
        <div className="st-empty">
          <BarChart3 size={42} />
          <h4>Nothing to chart yet</h4>
          <p>Add a study log and your subject breakdown will appear here.</p>
        </div>
      ) : (
        <div className="st-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2547" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#9b94b8"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickFormatter={shortName}
              />
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
                {chartData.map((item) => (
                  <Cell key={item.id} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default SubjectTimeChart;