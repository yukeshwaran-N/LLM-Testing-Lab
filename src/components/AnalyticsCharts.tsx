import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TestRun } from "@/types/test";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Shield, Activity, Target } from "lucide-react";

interface AnalyticsChartsProps {
  history: TestRun[];
  stats: {
    totalVulnerable: number;
    totalSafe: number;
    totalRuns: number;
  };
}

const AnalyticsCharts = ({ history, stats }: AnalyticsChartsProps) => {
  // 1. CALCULATE DATA
  const pieData = [
    { name: "Vulnerable", value: stats.totalVulnerable, color: "hsl(var(--destructive))" },
    { name: "Safe", value: stats.totalSafe, color: "hsl(var(--success))" }
  ];

  const barData = history.slice(-8).map((run, idx) => ({
    name: `Run ${history.length - 7 + idx}`,
    vulnerable: run.vulnerableCount,
    safe: run.results.length - run.vulnerableCount
  }));

  const lineData = history.slice(-10).map((run, idx) => {
    const safetyRate = run.results.length > 0
      ? ((run.results.length - run.vulnerableCount) / run.results.length) * 100
      : 0;
    return {
      name: `#${history.length - 9 + idx}`,
      rate: Math.round(safetyRate)
    };
  });

  const totalResponses = stats.totalVulnerable + stats.totalSafe;
  const vulnerabilityRate = totalResponses > 0 ? (stats.totalVulnerable / totalResponses) * 100 : 0;
  const safetyRate = totalResponses > 0 ? (stats.totalSafe / totalResponses) * 100 : 0;
  const avgVulnerabilitiesPerRun = stats.totalRuns > 0 ? stats.totalVulnerable / stats.totalRuns : 0;

  // 2. SUMMARY CARDS
  const summaryCards = [
    {
      title: "Total Tests",
      value: stats.totalRuns,
      icon: Activity,
      color: "text-blue-500",
      description: "Tests executed"
    },
    {
      title: "Vulnerability Rate",
      value: `${vulnerabilityRate.toFixed(1)}%`,
      icon: AlertTriangle,
      color: "text-red-500",
      description: "Models provided harmful info"
    },
    {
      title: "Safety Rate",
      value: `${safetyRate.toFixed(1)}%`,
      icon: Shield,
      color: "text-green-500",
      description: "Models correctly refused"
    },
    {
      title: "Avg per Run",
      value: avgVulnerabilitiesPerRun.toFixed(1),
      icon: TrendingUp,
      color: "text-purple-500",
      description: "Vulnerabilities per test"
    }
  ];

  // 3. NO DATA STATE
  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Test Data</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Run security tests to generate analytics and insights.
          </p>
        </div>
      </div>
    );
  }

  // 4. MAIN ANALYTICS DASHBOARD
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {stats.totalRuns} test runs
          </Badge>
          <span className="text-sm text-muted-foreground">
            {totalResponses} total responses analyzed
          </span>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${card.color.replace('text-', 'bg-')}/10`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-sm text-muted-foreground">{card.title}</div>
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* PIE CHART - Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4" />
              Response Distribution
            </CardTitle>
            <CardDescription>
              Vulnerable vs Safe responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Responses"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* LINE CHART - Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Safety Rate Trend
            </CardTitle>
            <CardDescription>
              Model performance over last 10 tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Safety Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* BAR CHART - Recent Runs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Test Runs</CardTitle>
            <CardDescription>
              Breakdown of last 8 test runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="vulnerable"
                    name="Vulnerable"
                    fill="hsl(var(--destructive))"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="safe"
                    name="Safe"
                    fill="hsl(var(--success))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KEY METRICS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Highest Safety Rate</div>
              <div className="text-2xl font-bold">
                {Math.max(...lineData.map(d => d.rate))}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Lowest Safety Rate</div>
              <div className="text-2xl font-bold">
                {Math.min(...lineData.map(d => d.rate))}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Average Safety</div>
              <div className="text-2xl font-bold">
                {lineData.length > 0
                  ? Math.round(lineData.reduce((a, b) => a + b.rate, 0) / lineData.length)
                  : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;