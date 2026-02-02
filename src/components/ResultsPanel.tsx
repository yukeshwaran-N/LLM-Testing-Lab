import { useState, useEffect } from "react";
import { FileWarning, Loader2, BarChart3, AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { TestResult, TestMetrics, VulnerabilityScore } from "@/types/test";
import SummaryCards from "./SummaryCards";
import AttemptCard from "./AttemptCard";
import { Progress } from "@/components/ui/progress";
import { calculateTestMetrics, calculateVulnerabilityScore } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ResultsPanelProps {
  results: TestResult[];
  isLoading: boolean;
  progress: number;
  topic?: string; // Make optional with ?
}

const ResultsPanel = ({ results, isLoading, progress, topic }: ResultsPanelProps) => {
  const [metrics, setMetrics] = useState<TestMetrics | null>(null);
  const [vulnerabilityScores, setVulnerabilityScores] = useState<VulnerabilityScore[]>([]);
  const [activeTab, setActiveTab] = useState("results");

  useEffect(() => {
    if (results.length > 0) {
      const calculatedMetrics = calculateTestMetrics(results);
      const scores = results.map(result => calculateVulnerabilityScore(result));
      setMetrics(calculatedMetrics);
      setVulnerabilityScores(scores);
    }
  }, [results]);

  const hasResults = results.length > 0;
  const vulnerableCount = results.filter(r => r.verdict === "VULNERABLE").length;
  const safeCount = results.filter(r => r.verdict === "SAFE").length;

  return (
    <div className="h-full flex flex-col animate-slide-in-right">
      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Running security tests...</span>
            <span className="font-mono text-primary">
              {Math.round(progress)}% • {results.length} attempts
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            Analyzing response patterns and calculating security metrics...
          </div>
        </div>
      )}

      {/* Tabs for different views */}
      {hasResults && metrics && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="results">
              <FileWarning className="w-4 h-4 mr-2" />
              Results ({results.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <div className="w-full mb-6">

              <SummaryCards results={results} />
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
              <Badge variant={vulnerableCount > 0 ? "destructive" : "outline"}>
                {vulnerableCount} Vulnerable
              </Badge>
              <Badge variant="outline">
                {safeCount} Safe
              </Badge>
              <Badge variant="outline">
                Success Rate: {metrics.successRate.toFixed(1)}%
              </Badge>
              <Badge variant="outline">
                CI: {metrics.confidenceInterval[0].toFixed(1)}%-{metrics.confidenceInterval[1].toFixed(1)}%
              </Badge>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {results.map((result, index) => (
                <AttemptCard
                  key={result.attempt}
                  result={result}
                  index={index}
                  vulnerabilityScore={vulnerabilityScores[index]}
                />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistical Analysis
                </CardTitle>
                <CardDescription>
                  Detailed metrics and statistical significance for this test run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Precision</div>
                    <div className="text-2xl font-bold">
                      {metrics.precision.toFixed(3)}
                      <span className="text-xs ml-2 text-muted-foreground">
                        TP/(TP+FP)
                      </span>
                    </div>
                    <Progress value={metrics.precision * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Recall</div>
                    <div className="text-2xl font-bold">
                      {metrics.recall.toFixed(3)}
                      <span className="text-xs ml-2 text-muted-foreground">
                        TP/(TP+FN)
                      </span>
                    </div>
                    <Progress value={metrics.recall * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">F1 Score</div>
                    <div className="text-2xl font-bold">
                      {metrics.f1Score.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Harmonic mean of precision & recall
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Statistical Power</div>
                    <div className="text-2xl font-bold">
                      {metrics.statisticalPower.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      1-β (probability of detecting effect)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Error Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>False Positive Rate</span>
                        <span className="font-mono">{metrics.falsePositiveRate.toFixed(3)}</span>
                      </div>
                      <Progress value={metrics.falsePositiveRate * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>False Negative Rate</span>
                        <span className="font-mono">{metrics.falseNegativeRate.toFixed(3)}</span>
                      </div>
                      <Progress value={metrics.falseNegativeRate * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Confidence Intervals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm mb-2">Success Rate (95% CI)</div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                          <div className="text-center font-mono">
                            {metrics.successRate.toFixed(1)}% ± {metrics.standardError.toFixed(1)}%
                          </div>
                          <div className="text-xs text-center text-muted-foreground mt-1">
                            [{metrics.confidenceInterval[0].toFixed(1)}% - {metrics.confidenceInterval[1].toFixed(1)}%]
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vulnerability Scores Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vulnerabilityScores.map((score, index) => {
                    const result = results[index];
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                        <div className="w-8 text-center font-mono text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {result.verdict === "VULNERABLE" ? "Vulnerability Detected" : "Safe Response"}
                            </span>
                            <Badge variant={
                              score.severity === 'CRITICAL' ? 'destructive' :
                                score.severity === 'HIGH' ? 'destructive' :
                                  score.severity === 'MEDIUM' ? 'secondary' : 'outline'
                            }>
                              {score.severity} ({score.score}/100)
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Progress value={score.score} className="h-2" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Confidence: {score.confidence}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Quality Metrics</CardTitle>
                <CardDescription>
                  Detailed analysis of test quality and response characteristics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Average Response Length</div>
                    <div className="text-2xl font-bold">
                      {metrics.averageResponseLength.toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground ml-2">words</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Longer responses may indicate more detailed instructions
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Refusal Strength</div>
                    <div className="text-2xl font-bold">
                      {metrics.refusalStrength.toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground ml-2">/100</span>
                    </div>
                    <Progress value={metrics.refusalStrength} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      How strongly models refuse harmful requests
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Instructional Clarity</div>
                    <div className="text-2xl font-bold">
                      {metrics.instructionalClarity.toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground ml-2">/100</span>
                    </div>
                    <Progress value={metrics.instructionalClarity} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Clarity of provided instructions (higher = more dangerous)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicators Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vulnerabilityScores.flatMap((score, idx) =>
                    Object.entries(score.indicators).map(([key, value]) => ({
                      attempt: idx + 1,
                      indicator: key,
                      value,
                      severity: score.severity
                    }))
                  ).slice(0, 8).map((item, idx) => (
                    <div key={idx} className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">
                        Attempt #{item.attempt} • {item.indicator.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof item.value === 'boolean' ? (
                          <>
                            {item.value ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm">{item.value ? 'Yes' : 'No'}</span>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <Progress value={item.value as number} className="h-2" />
                            </div>
                            <span className="text-xs font-mono">{(item.value as number).toFixed(0)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!hasResults && !isLoading && (
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
  );
};

export default ResultsPanel;