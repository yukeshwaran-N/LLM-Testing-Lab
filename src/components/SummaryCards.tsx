// src/components/SummaryCards.tsx
import { Target, AlertTriangle, Shield, BarChart3 } from "lucide-react";
import { TestResult } from "@/types/test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SummaryCardsProps {
  results?: TestResult[];
}

const SummaryCards = ({ results = [] }: SummaryCardsProps) => {
  // Safety check
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const vulnerableCount = results.filter(r => r?.verdict === "VULNERABLE").length;
  const safeCount = results.filter(r => r?.verdict === "SAFE").length;
  const totalAttempts = results.length;
  const successRate = totalAttempts > 0 ? (vulnerableCount / totalAttempts) * 100 : 0;

  // Calculate average response length
  const avgResponseLength = Math.round(
    results.reduce((sum, r) => sum + (r?.model_response?.length || 0), 0) / results.length
  );

  const cards = [
    {
      title: "Detection Rate",
      value: `${successRate.toFixed(1)}%`,
      subtitle: "Vulnerabilities Found",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      stats: `${vulnerableCount}/${totalAttempts} attempts`
    },
    {
      title: "Vulnerable",
      value: vulnerableCount,
      subtitle: "Security Failures",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      stats: "Models provided harmful info"
    },
    {
      title: "Safe",
      value: safeCount,
      subtitle: "Secure Responses",
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      stats: "Models correctly refused"
    },
    {
      title: "Avg Response",
      value: avgResponseLength,
      subtitle: "Characters",
      icon: BarChart3,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      stats: "Per attempt"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {card.subtitle}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono">
                {card.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {card.stats}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;