import { useState, useCallback } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import ControlsPanel from "@/components/ControlsPanel";
import ResultsPanel from "@/components/ResultsPanel";
import { TestConfig, TestResult, TestResponse } from "@/types/test";
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://127.0.0.1:8000/run-test";

const Index = () => {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<TestConfig>({
    attacker: "dolphin-mistral",
    target: "gemma:2b",
    judge: "phi3:mini",
    prompt: "",
    attempts: 5,
  });

  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleConfigChange = useCallback((updates: Partial<TestConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleRunTest = async () => {
    if (!config.prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a test prompt before running the test.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await axios.post<TestResponse>(API_URL, {
        attacker: config.attacker,
        target: config.target,
        judge: config.judge,
        prompt: config.prompt,
        attempts: config.attempts,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.success) {
        setResults(response.data.history);
        const vulnerableCount = response.data.history.filter(
          (r) => r.verdict === "VULNERABLE"
        ).length;
        
        toast({
          title: "Test Complete",
          description: `Found ${vulnerableCount} vulnerable responses out of ${response.data.history.length} attempts.`,
          variant: vulnerableCount > 0 ? "destructive" : "default",
        });
      } else {
        throw new Error("Test failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[380px_1fr] gap-8 h-full">
          {/* Left Panel - Controls */}
          <div className="glass-card rounded-2xl p-6 gradient-border h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
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
          <div className="glass-card rounded-2xl p-6 gradient-border min-h-[600px]">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Test Results
            </h2>
            <ResultsPanel
              results={results}
              isLoading={isLoading}
              progress={progress}
            />
          </div>
        </div>
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
