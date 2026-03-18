import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function QualityChart({ data }: { data: any[] }) {
  return (
    <div className="glass rounded-xl p-6 shadow-depth">
      <h3 className="text-xl font-semibold">Quality Trend</h3>
      <p className="text-sm text-muted-foreground mb-4">Monthly quality and compliance scores</p>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
          <XAxis dataKey="date" tick={{ fill: "hsl(215 12% 50%)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[70, 100]} tick={{ fill: "hsl(215 12% 50%)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(188 80% 48%)"
            strokeWidth={2.5}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="compliance"
            stroke="hsl(158 64% 42%)"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
