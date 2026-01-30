import { Activity, Shield, AlertTriangle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalRuns: number;
    totalAttempts: number;
    totalVulnerable: number;
    totalSafe: number;
    vulnerablePercent: number;
    safePercent: number;
    avgAttempts: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      label: "Total Runs",
      value: stats.totalRuns,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      label: "Vulnerable %",
      value: `${stats.vulnerablePercent.toFixed(1)}%`,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      label: "Safe %",
      value: `${stats.safePercent.toFixed(1)}%`,
      icon: Shield,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      label: "Avg Attempts",
      value: stats.avgAttempts.toFixed(1),
      icon: BarChart3,
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div 
          key={card.label}
          className="glass-card rounded-xl p-4 gradient-border"
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", card.bgColor)}>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={cn("text-xl font-bold font-mono", card.color)}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
