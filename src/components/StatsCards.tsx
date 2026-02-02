import { Activity, Shield, AlertTriangle, BarChart3, TrendingUp, Target, Zap, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatsCardsProps {
  stats: {
    totalRuns: number;
    totalAttempts: number;
    totalVulnerable: number;
    totalSafe: number;
    vulnerablePercent: number;
    safePercent: number;
    avgAttempts: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    falsePositiveRate?: number;
    confidenceInterval?: [number, number];
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      label: "Total Test Runs",
      value: stats.totalRuns.toLocaleString(),
      description: "Total security tests executed",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
      tooltip: "Cumulative test executions across all sessions"
    },
    {
      label: "Vulnerability Detection",
      value: `${stats.vulnerablePercent.toFixed(1)}%`,
      description: "Precision: " + (stats.precision ? `${(stats.precision * 100).toFixed(1)}%` : "N/A"),
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      tooltip: `Detected ${stats.totalVulnerable} vulnerabilities with ${stats.precision ? (stats.precision * 100).toFixed(1) : 'N/A'}% precision`
    },
    {
      label: "Model Safety Rate",
      value: `${stats.safePercent.toFixed(1)}%`,
      description: "Recall: " + (stats.recall ? `${(stats.recall * 100).toFixed(1)}%` : "N/A"),
      icon: Shield,
      color: "text-success",
      bgColor: "bg-success/10",
      tooltip: `${stats.totalSafe} safe responses detected with ${stats.recall ? (stats.recall * 100).toFixed(1) : 'N/A'}% recall`
    },
    {
      label: "Avg Attempts to Detect",
      value: stats.avgAttempts.toFixed(1),
      description: "Efficiency metric",
      icon: BarChart3,
      color: "text-warning",
      bgColor: "bg-warning/10",
      tooltip: "Average number of attempts required to detect a vulnerability"
    },
    {
      label: "F1 Score",
      value: stats.f1Score ? `${(stats.f1Score * 100).toFixed(1)}%` : "N/A",
      description: "Balanced accuracy",
      icon: Target,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      tooltip: "Harmonic mean of precision and recall"
    },
    {
      label: "False Positive Rate",
      value: stats.falsePositiveRate ? `${(stats.falsePositiveRate * 100).toFixed(1)}%` : "N/A",
      description: "Type I error rate",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      tooltip: "Percentage of safe responses incorrectly flagged as vulnerable"
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <Tooltip key={card.label}>
            <TooltipTrigger asChild>
              <div
                className="glass-card rounded-xl p-4 gradient-border hover:scale-[1.02] transition-transform cursor-help"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", card.bgColor)}>
                    <card.icon className={cn("w-5 h-5", card.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className={cn("text-xl font-bold font-mono", card.color)}>
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-sm">{card.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default StatsCards;