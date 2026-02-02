import { useState } from "react";
import {
  ChevronDown, ChevronUp, Copy, Check, Shield, ShieldAlert,
  AlertTriangle, Info, BarChart3, Target, Clock, FileText
} from "lucide-react";
import { TestResult, VulnerabilityScore } from "@/types/test";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttemptCardProps {
  result: TestResult;
  index: number;
  vulnerabilityScore?: VulnerabilityScore;
}

const AttemptCard = ({ result, index, vulnerabilityScore }: AttemptCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isVulnerable = result.verdict === "VULNERABLE";
  const severityColor = vulnerabilityScore?.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
    vulnerabilityScore?.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
      vulnerabilityScore?.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
        'bg-green-500/20 text-green-500';

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Calculate response statistics
  const response = result.model_response || result.target_response || "";
  const responseWordCount = response.split(/\s+/).length;
  const promptWordCount = result.attack_prompt.split(/\s+/).length;
  const hasSafetyWarning = response.toLowerCase().includes("cannot") ||
    response.toLowerCase().includes("should not");
  const hasInstructions = response.toLowerCase().includes("step") ||
    response.toLowerCase().includes("first") ||
    /\d+\.\s+\w+/.test(response);

  return (
    <TooltipProvider>
      <div
        className={`glass-card rounded-xl border overflow-hidden transition-all duration-300 animate-fade-in ${isVulnerable ? "border-destructive/30" : "border-success/30"
          }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                #{result.attempt.toString().padStart(2, "0")}
              </span>

              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${severityColor}`}
              >
                {isVulnerable ? (
                  <ShieldAlert className="w-3 h-3" />
                ) : (
                  <Shield className="w-3 h-3" />
                )}
                {result.verdict}
                {vulnerabilityScore && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {vulnerabilityScore.score}/100
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {responseWordCount}w
              </div>
              {hasSafetyWarning && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  Safety
                </Badge>
              )}
              {hasInstructions && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  Instructions
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground max-w-[200px] truncate hidden sm:block">
                  {result.reason}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{result.reason}</p>
              </TooltipContent>
            </Tooltip>

            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-border/50">
            {/* Vulnerability Score & Metrics */}
            {vulnerabilityScore && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Vulnerability Analysis
                  </h4>
                  <Badge variant={
                    vulnerabilityScore.severity === 'CRITICAL' ? 'destructive' :
                      vulnerabilityScore.severity === 'HIGH' ? 'destructive' :
                        vulnerabilityScore.severity === 'MEDIUM' ? 'secondary' : 'outline'
                  }>
                    {vulnerabilityScore.severity} • Confidence: {vulnerabilityScore.confidence}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <Progress value={vulnerabilityScore.score} className="h-2" />
                    <div className="text-xs font-mono text-right">{vulnerabilityScore.score}/100</div>
                  </div>

                  {Object.entries(vulnerabilityScore.indicators).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      {typeof value === 'boolean' ? (
                        <div className="text-sm">
                          {value ? '✓ Present' : '✗ Absent'}
                        </div>
                      ) : (
                        <>
                          <Progress value={value as number} className="h-2" />
                          <div className="text-xs font-mono text-right">{(value as number).toFixed(0)}/100</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rationale */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-medium">Key Indicators:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {vulnerabilityScore.rationale.slice(0, 3).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                <Info className="w-3 h-3" />
                Judge Verdict Rationale
              </h4>
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-sm text-foreground">{result.reason}</p>
              </div>
            </div>

            {/* Attack Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Attack Prompt ({promptWordCount} words)
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.attack_prompt, "attack")}
                    className="h-7 px-2 text-xs"
                  >
                    {copiedField === "attack" ? (
                      <Check className="w-3 h-3 mr-1 text-success" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 font-mono text-sm text-foreground/90 max-h-[150px] overflow-y-auto scrollbar-thin">
                {result.attack_prompt}
              </div>
            </div>

            {/* Target Response */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Target Response ({responseWordCount} words)
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(response, "response")}
                    className="h-7 px-2 text-xs"
                  >
                    {copiedField === "response" ? (
                      <Check className="w-3 h-3 mr-1 text-success" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 font-mono text-sm text-foreground/90 max-h-[200px] overflow-y-auto scrollbar-thin">
                {response}
              </div>

              {/* Response Analysis */}
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="text-xs text-muted-foreground">
                  Word Count: <span className="font-mono">{responseWordCount}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Has Safety: <span className={hasSafetyWarning ? "text-success" : "text-muted"}>{hasSafetyWarning ? "✓" : "✗"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Has Instructions: <span className={hasInstructions ? "text-destructive" : "text-muted"}>{hasInstructions ? "✓" : "✗"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Verdict: <span className={isVulnerable ? "text-destructive font-semibold" : "text-success font-semibold"}>{result.verdict}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AttemptCard;