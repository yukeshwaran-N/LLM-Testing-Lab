import { FileWarning, Loader2 } from "lucide-react";
import { TestResult } from "@/types/test";
import SummaryCards from "./SummaryCards";
import AttemptCard from "./AttemptCard";
import { Progress } from "@/components/ui/progress";

interface ResultsPanelProps {
  results: TestResult[];
  isLoading: boolean;
  progress: number;
}

const ResultsPanel = ({ results, isLoading, progress }: ResultsPanelProps) => {
  const hasResults = results.length > 0;

  return (
    <div className="h-full flex flex-col animate-slide-in-right">
      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Running security tests...</span>
            <span className="font-mono text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Summary Cards */}
      {hasResults && <SummaryCards results={results} />}

      {/* Results List */}
      <div className="flex-1 overflow-hidden">
        {hasResults ? (
          <div className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {results.map((result, index) => (
              <AttemptCard key={result.attempt} result={result} index={index} />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                <FileWarning className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Results Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Configure your test parameters and click "Run Test" to begin jailbreak testing.
              </p>
            </div>
          )
        )}

        {isLoading && !hasResults && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Executing Tests
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Testing LLM models for jailbreak vulnerabilities...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
