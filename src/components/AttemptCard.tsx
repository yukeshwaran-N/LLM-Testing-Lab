import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Shield, ShieldAlert } from "lucide-react";
import { TestResult } from "@/types/test";
import { Button } from "@/components/ui/button";

interface AttemptCardProps {
  result: TestResult;
  index: number;
}

const AttemptCard = ({ result, index }: AttemptCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isVulnerable = result.verdict === "VULNERABLE";

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div
      className={`glass-card rounded-xl border overflow-hidden transition-all duration-300 animate-fade-in ${
        isVulnerable ? "border-destructive/30" : "border-success/30"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-muted-foreground">
            #{result.attempt.toString().padStart(2, "0")}
          </span>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isVulnerable
                ? "bg-destructive/20 text-destructive"
                : "bg-success/20 text-success"
            }`}
          >
            {isVulnerable ? (
              <ShieldAlert className="w-3 h-3" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
            {result.verdict}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground max-w-[300px] truncate hidden sm:block">
            {result.reason}
          </span>
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
          {/* Reason */}
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Reason
            </h4>
            <p className="text-sm text-foreground">{result.reason}</p>
          </div>

          {/* Attack Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Attack Prompt
              </h4>
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
            <div className="bg-secondary/50 rounded-lg p-3 font-mono text-sm text-foreground/90 max-h-[150px] overflow-y-auto scrollbar-thin">
              {result.attack_prompt}
            </div>
          </div>

          {/* Target Response */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Target Response
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.model_response, "response")}
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
            <div className="bg-secondary/50 rounded-lg p-3 font-mono text-sm text-foreground/90 max-h-[200px] overflow-y-auto scrollbar-thin">
              {result.model_response}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptCard;
