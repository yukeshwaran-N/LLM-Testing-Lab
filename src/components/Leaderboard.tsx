import { Trophy, Medal, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Define the interface locally
interface ModelStats {
  model: string;
  totalTests: number;
  vulnerableCount: number;
  safeCount: number;
  vulnerablePercent: number;
  safePercent: number;
}

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
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Leaderboard Data</h3>
        <p className="text-gray-500">
          Run tests to populate the model vulnerability leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
        <Trophy className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">Model Vulnerability Leaderboard</h3>
        <span className="text-xs text-gray-500 ml-auto">Sorted by vulnerability rate</span>
      </div>

      <div className="divide-y divide-gray-200">
        {modelStats.map((stat, index) => (
          <div
            key={stat.model}
            className={cn(
              "p-4 flex items-center gap-4",
              index === 0 && "bg-red-50"
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
                  className="text-xs bg-gray-100"
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
                    ? "text-red-600"
                    : stat.vulnerablePercent > 25
                      ? "text-orange-500"
                      : "text-green-600"
                )}>
                  {stat.vulnerablePercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-mono">{stat.vulnerableCount}</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
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