import { useState, useCallback } from "react";
import { TestRun, TestResult } from "@/types/test";

const STORAGE_KEY = "llm-red-team-history";

export const useTestHistory = () => {
  const [history, setHistory] = useState<TestRun[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const saveRun = useCallback((run: Omit<TestRun, 'id' | 'date'>) => {
    const newRun: TestRun = {
      ...run,
      id: `run-${Date.now()}`,
      date: new Date().toISOString()
    };
    
    setHistory(prev => {
      const updated = [newRun, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    return newRun;
  }, []);

  const deleteRun = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(run => run.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getRun = useCallback((id: string) => {
    return history.find(run => run.id === id);
  }, [history]);

  const getStats = useCallback(() => {
    const totalRuns = history.length;
    const totalAttempts = history.reduce((sum, run) => sum + run.results.length, 0);
    const totalVulnerable = history.reduce((sum, run) => sum + run.vulnerableCount, 0);
    const totalSafe = totalAttempts - totalVulnerable;
    
    return {
      totalRuns,
      totalAttempts,
      totalVulnerable,
      totalSafe,
      vulnerablePercent: totalAttempts > 0 ? (totalVulnerable / totalAttempts) * 100 : 0,
      safePercent: totalAttempts > 0 ? (totalSafe / totalAttempts) * 100 : 0,
      avgAttempts: totalRuns > 0 ? totalAttempts / totalRuns : 0
    };
  }, [history]);

  const getModelStats = useCallback(() => {
    const modelMap = new Map<string, { total: number; vulnerable: number; safe: number }>();
    
    history.forEach(run => {
      const targets = Array.isArray(run.target) ? run.target : [run.target];
      targets.forEach(target => {
        const current = modelMap.get(target) || { total: 0, vulnerable: 0, safe: 0 };
        run.results.forEach(result => {
          if (result.target_model === target || !result.target_model) {
            current.total++;
            if (result.verdict === 'VULNERABLE') {
              current.vulnerable++;
            } else {
              current.safe++;
            }
          }
        });
        modelMap.set(target, current);
      });
    });
    
    return Array.from(modelMap.entries()).map(([model, stats]) => ({
      model,
      totalTests: stats.total,
      vulnerableCount: stats.vulnerable,
      safeCount: stats.safe,
      vulnerablePercent: stats.total > 0 ? (stats.vulnerable / stats.total) * 100 : 0
    })).sort((a, b) => b.vulnerablePercent - a.vulnerablePercent);
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
