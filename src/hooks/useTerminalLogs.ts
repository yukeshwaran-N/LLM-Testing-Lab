import { useState, useCallback, useRef } from "react";
import { LogEntry } from "@/types/test";

export const useTerminalLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idCounter = useRef(0);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const entry: LogEntry = {
      id: `log-${++idCounter.current}`,
      timestamp: new Date(),
      type,
      message
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const logAttacker = useCallback((message: string) => addLog('attacker', message), [addLog]);
  const logTarget = useCallback((message: string) => addLog('target', message), [addLog]);
  const logJudge = useCallback((message: string) => addLog('judge', message), [addLog]);
  const logSystem = useCallback((message: string) => addLog('system', message), [addLog]);
  const logError = useCallback((message: string) => addLog('error', message), [addLog]);
  const logSuccess = useCallback((message: string) => addLog('success', message), [addLog]);

  return {
    logs,
    addLog,
    clearLogs,
    logAttacker,
    logTarget,
    logJudge,
    logSystem,
    logError,
    logSuccess
  };
};
