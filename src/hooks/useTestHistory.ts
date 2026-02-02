// src/hooks/useTestHistory.ts
import { useState, useEffect, useCallback } from "react";
import { TestRun, TestResult } from "@/types/test";

const HISTORY_KEY = "llm-redteam-history";

export interface Stats {
  totalRuns: number;
  totalAttempts: number;
  totalVulnerable: number;
  totalSafe: number;
  vulnerablePercent: number;
  safePercent: number;
  avgAttempts: number;
}

export const useTestHistory = () => {
  const [history, setHistory] = useState<TestRun[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse history:", error);
      }
    }
  }, []);

  // Save a test run to history - accepts Omit<TestRun, "id" | "date">
  const saveRun = useCallback((run: Omit<TestRun, "id" | "date">) => {
    const newRun: TestRun = {
      ...run,
      id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    };

    const newHistory = [newRun, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  }, [history]);

  // Delete a test run from history
  const deleteRun = useCallback((id: string) => {
    const newHistory = history.filter(run => run.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  }, [history]);

  // Get a specific run by ID
  const getRun = useCallback((id: string) => {
    return history.find(run => run.id === id);
  }, [history]);

  // Get statistics - returns format expected by StatsCards
  const getStats = useCallback((): Stats => {
    const totalRuns = history.length;
    const totalVulnerable = history.reduce((acc, run) => acc + run.vulnerableCount, 0);
    const totalAttempts = history.reduce((acc, run) => acc + (run.totalAttempts || run.results.length), 0);
    const totalSafe = totalAttempts - totalVulnerable;

    return {
      totalRuns,
      totalAttempts,
      totalVulnerable,
      totalSafe,
      vulnerablePercent: totalAttempts > 0 ? Math.round((totalVulnerable / totalAttempts) * 100) : 0,
      safePercent: totalAttempts > 0 ? Math.round((totalSafe / totalAttempts) * 100) : 0,
      avgAttempts: totalRuns > 0 ? Math.round(totalAttempts / totalRuns) : 0,
    };
  }, [history]);

  // Get model statistics for leaderboard
  const getModelStats = useCallback(() => {
    const modelStats: Record<string, { tests: number; vulnerabilities: number; successRate: number }> = {};

    history.forEach(run => {
      const targets = Array.isArray(run.target) ? run.target : [run.target];
      targets.forEach(target => {
        if (!modelStats[target]) {
          modelStats[target] = { tests: 0, vulnerabilities: 0, successRate: 0 };
        }
        modelStats[target].tests += 1;

        // Count vulnerabilities for this model in this run
        const modelVulnerabilities = run.results.filter(r =>
          r.target_model === target && r.verdict === "VULNERABLE"
        ).length;
        modelStats[target].vulnerabilities += modelVulnerabilities;
      });
    });

    // Calculate success rates
    Object.keys(modelStats).forEach(model => {
      const stats = modelStats[model];
      stats.successRate = stats.tests > 0 ? Math.round((stats.vulnerabilities / stats.tests) * 100) : 0;
    });

    return Object.entries(modelStats)
      .map(([model, stats]) => ({ model, ...stats }))
      .sort((a, b) => b.vulnerabilities - a.vulnerabilities);
  }, [history]);

  return {
    history,
    saveRun,
    deleteRun,
    getRun,
    getStats,
    getModelStats
  };
};