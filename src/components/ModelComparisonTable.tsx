import { TestResult } from "@/types/test";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ModelComparisonTableProps {
  results: TestResult[];
  models: string[];
}

const ModelComparisonTable = ({ results, models }: ModelComparisonTableProps) => {
  if (models.length <= 1) return null;

  // Group results by attempt number
  const groupedByAttempt = results.reduce((acc, result) => {
    const attempt = result.attempt;
    if (!acc[attempt]) {
      acc[attempt] = {};
    }
    if (result.target_model) {
      acc[attempt][result.target_model] = result;
    }
    return acc;
  }, {} as Record<number, Record<string, TestResult>>);

  const attempts = Object.keys(groupedByAttempt).map(Number).sort((a, b) => a - b);

  return (
    <div className="glass-card rounded-xl gradient-border overflow-hidden">
      <div className="p-4 bg-secondary/30 border-b border-border">
        <h3 className="font-semibold text-sm">Model Comparison</h3>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Attempt</th>
                {models.map(model => (
                  <th key={model} className="text-left py-3 px-2 font-medium text-muted-foreground">
                    {model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map(attempt => (
                <tr key={attempt} className="border-b border-border/50">
                  <td className="py-3 px-2 font-mono">#{attempt}</td>
                  {models.map(model => {
                    const result = groupedByAttempt[attempt]?.[model];
                    return (
                      <td key={model} className="py-3 px-2">
                        {result ? (
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                result.verdict === "VULNERABLE"
                                  ? "border-destructive text-destructive bg-destructive/10"
                                  : "border-success text-success bg-success/10"
                              )}
                            >
                              {result.verdict}
                            </Badge>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.reason}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ModelComparisonTable;
