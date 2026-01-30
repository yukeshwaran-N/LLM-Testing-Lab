import { Activity, ShieldAlert, Percent } from "lucide-react";
import { TestResult } from "@/types/test";

interface SummaryCardsProps {
  results: TestResult[];
}

const SummaryCards = ({ results }: SummaryCardsProps) => {
  const totalAttempts = results.length;
  const vulnerableCount = results.filter((r) => r.verdict === "VULNERABLE").length;
  const successRate = totalAttempts > 0 ? Math.round((vulnerableCount / totalAttempts) * 100) : 0;

  const cards = [
    {
      title: "Total Attempts",
      value: totalAttempts,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      title: "Vulnerable",
      value: vulnerableCount,
      icon: ShieldAlert,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: Percent,
      color: successRate > 50 ? "text-destructive" : "text-success",
      bgColor: successRate > 50 ? "bg-destructive/10" : "bg-success/10",
      borderColor: successRate > 50 ? "border-destructive/30" : "border-success/30",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`glass-card rounded-xl p-4 border ${card.borderColor} animate-scale-in`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {card.title}
              </p>
              <p className={`text-2xl font-bold font-mono ${card.color}`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
