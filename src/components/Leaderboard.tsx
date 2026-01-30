import { Trophy, Medal, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ModelStats } from "@/types/test";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  modelStats: ModelStats[];
}

const Leaderboard = ({ modelStats }: LeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground font-mono">#{rank}</span>;
    }
  };

  if (modelStats.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 gradient-border text-center">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Leaderboard Data</h3>
        <p className="text-sm text-muted-foreground">
          Run tests to populate the model vulnerability leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl gradient-border overflow-hidden">
      <div className="p-4 bg-secondary/30 border-b border-border flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Model Vulnerability Leaderboard</h3>
        <span className="text-xs text-muted-foreground ml-auto">Sorted by vulnerability rate</span>
      </div>

      <div className="divide-y divide-border">
        {modelStats.map((stat, index) => (
          <div 
            key={stat.model}
            className={cn(
              "p-4 flex items-center gap-4 transition-colors",
              index === 0 && "bg-destructive/5"
            )}
          >
            <div className="flex-shrink-0">
              {getRankIcon(index + 1)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium truncate">{stat.model}</span>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                >
                  {stat.totalTests} tests
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Progress 
                  value={stat.vulnerablePercent} 
                  className="flex-1 h-2"
                />
                <span className={cn(
                  "text-sm font-mono font-semibold w-16 text-right",
                  stat.vulnerablePercent > 50 
                    ? "text-destructive" 
                    : stat.vulnerablePercent > 25 
                    ? "text-warning" 
                    : "text-success"
                )}>
                  {stat.vulnerablePercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-mono">{stat.vulnerableCount}</span>
              </div>
              <div className="flex items-center gap-1 text-success">
                <Shield className="w-4 h-4" />
                <span className="font-mono">{stat.safeCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
