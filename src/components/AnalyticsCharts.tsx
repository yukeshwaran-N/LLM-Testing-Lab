import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { TestRun } from "@/types/test";

interface AnalyticsChartsProps {
  history: TestRun[];
  stats: {
    totalVulnerable: number;
    totalSafe: number;
  };
}

const COLORS = {
  vulnerable: "hsl(var(--destructive))",
  safe: "hsl(var(--success))",
  primary: "hsl(var(--primary))"
};

const AnalyticsCharts = ({ history, stats }: AnalyticsChartsProps) => {
  const pieData = useMemo(() => [
    { name: "Vulnerable", value: stats.totalVulnerable, color: COLORS.vulnerable },
    { name: "Safe", value: stats.totalSafe, color: COLORS.safe }
  ], [stats]);

  const barData = useMemo(() => {
    return history.slice(0, 10).reverse().map((run, idx) => ({
      name: `Run ${idx + 1}`,
      attempts: run.attempts,
      vulnerable: run.vulnerableCount,
      safe: run.results.length - run.vulnerableCount
    }));
  }, [history]);

  const lineData = useMemo(() => {
    return history.slice(0, 20).reverse().map((run, idx) => ({
      name: `#${idx + 1}`,
      rate: run.results.length > 0 
        ? ((run.results.length - run.vulnerableCount) / run.results.length) * 100 
        : 0
    }));
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 gradient-border text-center">
        <p className="text-muted-foreground">No data available yet. Run some tests to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Pie Chart */}
      <div className="glass-card rounded-xl p-4 gradient-border">
        <h3 className="text-sm font-semibold mb-4">Verdict Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="glass-card rounded-xl p-4 gradient-border">
        <h3 className="text-sm font-semibold mb-4">Results per Run</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="vulnerable" stackId="a" fill={COLORS.vulnerable} name="Vulnerable" />
            <Bar dataKey="safe" stackId="a" fill={COLORS.safe} name="Safe" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="glass-card rounded-xl p-4 gradient-border">
        <h3 className="text-sm font-semibold mb-4">Safety Rate Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Safety Rate']}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke={COLORS.primary} 
              strokeWidth={2}
              dot={{ fill: COLORS.primary, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
