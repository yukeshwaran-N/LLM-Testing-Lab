import { useState, useCallback } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import ControlsPanel from "@/components/ControlsPanel";
import ResultsPanel from "@/components/ResultsPanel";
import TerminalLogs from "@/components/TerminalLogs";
import HistoryTable from "@/components/HistoryTable";
import StatsCards from "@/components/StatsCards";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import Leaderboard from "@/components/Leaderboard";
import ExportButtons from "@/components/ExportButtons";
import ModelComparisonTable from "@/components/ModelComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestConfig, TestResult, TestResponse, TestRun } from "@/types/test";
import { useToast } from "@/hooks/use-toast";
import { useTerminalLogs } from "@/hooks/useTerminalLogs";
import { useTestHistory } from "@/hooks/useTestHistory";
import { Play, History, BarChart3, Trophy } from "lucide-react";

const API_URL = "http://127.0.0.1:8000/run-test";

const Index = () => {
  const { toast } = useToast();
  const { logs, clearLogs, logAttacker, logTarget, logJudge, logSystem, logError, logSuccess } = useTerminalLogs();
  const { history, saveRun, deleteRun, getRun, getStats, getModelStats } = useTestHistory();
  
  const [activeTab, setActiveTab] = useState("run-test");
  const [config, setConfig] = useState<TestConfig>({
    attacker: "dolphin-mistral",
    target: ["gemma:2b"],
    judge: "phi3:mini",
    prompt: "",
    attempts: 5,
    parallelism: 1,
  });

  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);

  const handleConfigChange = useCallback((updates: Partial<TestConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleRunTest = async () => {
    const targets = Array.isArray(config.target) ? config.target : [config.target];
    
    if (!config.prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a test prompt before running the test.",
        variant: "destructive",
      });
      return;
    }

    if (targets.length === 0) {
      toast({
        title: "Missing Target",
        description: "Please select at least one target model.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setProgress(0);
    setCurrentAttempt(0);
    clearLogs();

    logSystem(`Starting test with ${config.attempts} attempts`);
    logSystem(`Parallelism: ${config.parallelism}`);
    logSystem(`Target models: ${targets.join(", ")}`);

    // Simulate streaming progress for UX
    const totalSteps = config.attempts * targets.length;
    let completedSteps = 0;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 8;
      });
    }, 400);

    try {
      // Run tests for each target model
      const allResults: TestResult[] = [];
      
      for (const target of targets) {
        logAttacker(`Generating attack prompts for ${target}...`);
        
        const response = await axios.post<TestResponse>(API_URL, {
          attacker: config.attacker,
          target: target,
          judge: config.judge,
          prompt: config.prompt,
          attempts: config.attempts,
        });

        if (response.data.success) {
          response.data.history.forEach((result, idx) => {
            const enrichedResult = { ...result, target_model: target };
            allResults.push(enrichedResult);
            
            // Log each result
            logTarget(`[${target}] Attempt ${result.attempt} completed`);
            if (result.verdict === "VULNERABLE") {
              logError(`[Judge] Verdict: VULNERABLE - ${result.reason.substring(0, 50)}...`);
            } else {
              logSuccess(`[Judge] Verdict: SAFE - ${result.reason.substring(0, 50)}...`);
            }
            
            completedSteps++;
            setCurrentAttempt(completedSteps);
            setResults([...allResults]);
          });
        }
      }

      clearInterval(progressInterval);
      setProgress(100);

      const vulnerableCount = allResults.filter(r => r.verdict === "VULNERABLE").length;
      
      // Save to history
      saveRun({
        attacker: config.attacker,
        target: config.target,
        judge: config.judge,
        attempts: config.attempts,
        vulnerableCount,
        results: allResults
      });

      logSystem(`Test complete: ${vulnerableCount}/${allResults.length} vulnerable`);
      
      toast({
        title: "Test Complete",
        description: `Found ${vulnerableCount} vulnerable responses out of ${allResults.length} attempts.`,
        variant: vulnerableCount > 0 ? "destructive" : "default",
      });
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      
      logError("Failed to connect to testing server");
      console.error("API Error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the testing server. Make sure the backend is running on http://127.0.0.1:8000",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleViewRun = (run: TestRun) => {
    setSelectedRun(run);
    setResults(run.results);
    setActiveTab("run-test");
  };

  const stats = getStats();
  const modelStats = getModelStats();
  const targetModels = Array.isArray(config.target) ? config.target : [config.target];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="glass-card gradient-border">
              <TabsTrigger value="run-test" className="gap-2 data-[state=active]:bg-primary/20">
                <Play className="w-4 h-4" />
                Run Test
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-primary/20">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-primary/20">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2 data-[state=active]:bg-primary/20">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            {activeTab === "run-test" && results.length > 0 && (
              <ExportButtons
                data={{
                  id: `run-${Date.now()}`,
                  date: new Date().toISOString(),
                  attacker: config.attacker,
                  target: config.target,
                  judge: config.judge,
                  attempts: config.attempts,
                  vulnerableCount: results.filter(r => r.verdict === "VULNERABLE").length,
                  results
                }}
                filename="llm-redteam-results"
              />
            )}

            {activeTab === "history" && history.length > 0 && (
              <ExportButtons
                data={history}
                filename="llm-redteam-history"
              />
            )}
          </div>

          {/* Run Test Tab */}
          <TabsContent value="run-test" className="space-y-6 mt-0">
            <div className="grid lg:grid-cols-[380px_1fr] gap-6">
              {/* Left Panel - Controls */}
              <div className="glass-card rounded-2xl p-5 gradient-border h-fit lg:sticky lg:top-24">
                <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Test Configuration
                </h2>
                <ControlsPanel
                  config={config}
                  onConfigChange={handleConfigChange}
                  onRunTest={handleRunTest}
                  isLoading={isLoading}
                />
              </div>

              {/* Right Panel - Results */}
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-5 gradient-border min-h-[500px]">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Test Results
                      {isLoading && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          Attempt {currentAttempt} of {config.attempts * targetModels.length}
                        </span>
                      )}
                    </h2>
                  </div>
                  <ResultsPanel
                    results={results}
                    isLoading={isLoading}
                    progress={progress}
                  />
                </div>

                {/* Model Comparison Table */}
                {targetModels.length > 1 && results.length > 0 && (
                  <ModelComparisonTable results={results} models={targetModels} />
                )}

                {/* Terminal Logs */}
                <TerminalLogs logs={logs} onClear={clearLogs} />
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <HistoryTable 
              history={history} 
              onView={handleViewRun}
              onDelete={deleteRun}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-0">
            <StatsCards stats={stats} />
            <AnalyticsCharts history={history} stats={stats} />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-0">
            <Leaderboard modelStats={modelStats} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-auto">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>LLM Red Team Lab — Automated Jailbreak Testing Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
