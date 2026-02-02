import { useState, useCallback, useEffect, useRef } from "react"; // Added useRef
import Navbar from "@/components/Navbar";
import ControlsPanel from "@/components/ControlsPanel";
import ResultsPanel from "@/components/ResultsPanel";
import TerminalLogs from "@/components/TerminalLogs";
import HistoryTable from "@/components/HistoryTable";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import Leaderboard from "@/components/Leaderboard";
import ExportButtons from "@/components/ExportButtons";
import ModelComparisonTable from "@/components/ModelComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestConfig, TestResult, TestRun } from "@/types/test";
import { useToast } from "@/hooks/use-toast";
import { useTerminalLogs } from "@/hooks/useTerminalLogs";
import { useTestHistory } from "@/hooks/useTestHistory";
import { Play, History, BarChart3, Trophy } from "lucide-react";
import { api } from "@/services/api";

const Index = () => {
  const { toast } = useToast();
  const { logs, clearLogs, logAttacker, logTarget, logJudge, logSystem, logError, logSuccess } = useTerminalLogs();
  const { history, saveRun, deleteRun, getStats, getModelStats } = useTestHistory();

  // ADDED: AbortController for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [activeTab, setActiveTab] = useState("run-test");
  const [config, setConfig] = useState<TestConfig>({
    attacker: "dolphin-mistral:latest",
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
  const [backendConnected, setBackendConnected] = useState(false);

  // Check backend connection on load
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isConnected = await api.checkHealth();
        setBackendConnected(isConnected);
        if (isConnected) {
          logSystem("✅ Backend connected");
        } else {
          logError("❌ Backend not connected");
        }
      } catch (error) {
        logError("Failed to check backend connection");
        setBackendConnected(false);
      }
    };

    checkBackend();
    logSystem("LLM Red Team Lab initialized");
  }, []);

  const handleConfigChange = useCallback((updates: Partial<TestConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // ADDED: Function to stop the test
  const handleStopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      logSystem("🛑 Test stopped by user");
      toast({
        title: "Test Stopped",
        description: "The test has been cancelled.",
        variant: "default",
      });
    }

    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setIsLoading(false);
    setProgress(0);
  };

  // ADDED: Cleanup function
  const cleanupTest = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    abortControllerRef.current = null;
    setIsLoading(false);
  };

  const handleRunTest = async () => {
    if (!backendConnected) {
      toast({
        title: "Backend Not Connected",
        description: "Please ensure the backend server is running on http://localhost:8000",
        variant: "destructive",
      });
      return;
    }

    // Stop any existing test first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

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

    // Create new AbortController for this test
    abortControllerRef.current = new AbortController();

    logSystem(`Starting test with ${config.attempts} attempts`);
    logSystem(`Parallelism: ${config.parallelism}`);
    logSystem(`Target models: ${targets.join(", ")}`);

    // Simulate streaming progress for UX
    const totalSteps = config.attempts * targets.length;
    let completedSteps = 0;

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressIntervalRef.current!);
          progressIntervalRef.current = null;
          return prev;
        }
        return prev + Math.random() * 8;
      });
    }, 400);

    try {
      // Run tests for each target model
      const allResults: TestResult[] = [];

      for (const target of targets) {
        // Check if test was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          logSystem("Test cancelled by user");
          break;
        }

        logAttacker(`Generating attack prompts for ${target}...`);

        // Use the corrected API endpoint with abort signal
        const result = await api.runAttack({
          topic: config.prompt,
          attacker_model: config.attacker,
          target_model: target,
          judge_model: config.judge,
          max_attempts: config.attempts,
        }, {
          signal: abortControllerRef.current?.signal
        });

        // Transform backend response to match frontend expected format
        if (result.all_attempts && result.all_attempts.length > 0) {
          result.all_attempts.forEach((attempt: any, idx: number) => {
            const enrichedResult: TestResult = {
              attempt: attempt.attempt,
              target_model: target,
              attacker_model: config.attacker,
              judge_model: config.judge,
              attack_prompt: attempt.attack_generated,
              model_response: attempt.target_response,
              verdict: attempt.verdict as "SAFE" | "VULNERABLE",
              reason: attempt.reason,
              timestamp: new Date().toISOString(),
              success: attempt.success,
            };

            allResults.push(enrichedResult);

            // Log each result
            logTarget(`[${target}] Attempt ${attempt.attempt} completed`);
            if (attempt.verdict === "VULNERABLE") {
              logError(`[Judge] Verdict: VULNERABLE - ${attempt.reason?.substring(0, 50) || 'No reason'}...`);
            } else {
              logSuccess(`[Judge] Verdict: SAFE - ${attempt.reason?.substring(0, 50) || 'No reason'}...`);
            }

            completedSteps++;
            setCurrentAttempt(completedSteps);
            setResults([...allResults]);
          });
        } else {
          // If no attempts returned, create a fallback result
          const fallbackResult: TestResult = {
            attempt: 1,
            target_model: target,
            attacker_model: config.attacker,
            judge_model: config.judge,
            attack_prompt: config.prompt,
            model_response: "No response from model",
            verdict: (result.verdict || "SAFE") as "SAFE" | "VULNERABLE",
            reason: result.vulnerability_reason || "Test completed",
            timestamp: new Date().toISOString(),
          };

          allResults.push(fallbackResult);
          completedSteps++;
          setCurrentAttempt(completedSteps);
          setResults([...allResults]);
        }
      }

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setProgress(100);

      const vulnerableCount = allResults.filter(r => r.verdict === "VULNERABLE").length;
      const totalAttempts = allResults.length;

      // Save to history (only if not cancelled)
      if (!abortControllerRef.current?.signal.aborted && allResults.length > 0) {
        saveRun({
          attacker: config.attacker,
          target: config.target,
          judge: config.judge,
          attempts: config.attempts,
          vulnerableCount,
          totalAttempts,
          results: allResults,
          prompt: config.prompt,
        });

        logSystem(`Test complete: ${vulnerableCount}/${totalAttempts} vulnerable`);

        toast({
          title: "Test Complete",
          description: `Found ${vulnerableCount} vulnerable responses out of ${totalAttempts} attempts.`,
          variant: vulnerableCount > 0 ? "destructive" : "default",
        });
      } else if (abortControllerRef.current?.signal.aborted) {
        logSystem("Test cancelled by user");
      }
    } catch (error: any) {
      // Check if error is due to abort
      if (error.name === 'AbortError') {
        logSystem("Test cancelled by user");
      } else {
        // Clear progress interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(0);

        logError(`Failed to run test: ${error.message || 'Unknown error'}`);
        console.error("API Error:", error);
        toast({
          title: "Test Failed",
          description: error.message || "Failed to run the test. Check backend connection.",
          variant: "destructive",
        });
      }
    } finally {
      cleanupTest();
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleViewRun = (run: TestRun) => {
    setSelectedRun(run);
    setResults(run.results || []);
    setActiveTab("run-test");
  };

  // ADDED: Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const stats = getStats();
  const modelStats = getModelStats();
  const targetModels = Array.isArray(config.target) ? config.target : [config.target];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />

      {/* Connection Status Banner */}
      {!backendConnected && (
        <div className="bg-red-900/30 border-b border-red-800 py-2 px-4">
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
            <span className="animate-pulse">⚠️</span>
            <span>Backend not connected. Make sure backend is running on http://localhost:8000</span>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300 underline ml-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

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
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    Test Configuration
                  </h2>
                  <div className={`text-xs px-2 py-1 rounded ${backendConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {backendConnected ? 'Backend Connected' : 'Backend Offline'}
                  </div>
                </div>
                <ControlsPanel
                  config={config}
                  onConfigChange={handleConfigChange}
                  onRunTest={handleRunTest}
                  onStopTest={handleStopTest} // ADDED: Pass stop function
                  isLoading={isLoading}
                  disabled={!backendConnected}
                />
              </div>

              {/* Right Panel - Results */}
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-5 gradient-border min-h-[500px]">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-success'}`} />
                      Test Results
                      {isLoading && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          Attempt {currentAttempt} of {config.attempts * targetModels.length}
                        </span>
                      )}
                    </h2>
                    {isLoading && (
                      <div className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded">
                        Click "Stop" in controls to cancel
                      </div>
                    )}
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
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsCharts history={history} stats={stats} />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-0">
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Leaderboard Coming Soon</h3>
              <p className="text-gray-500">
                Model performance rankings will be available in the next update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-auto">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <p>LLM Red Team Lab — Automated Jailbreak Testing Platform</p>
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs">
              Backend: {backendConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;