import { useRef, useEffect, useState } from "react";
import { Terminal, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogEntry } from "@/types/test";
import { cn } from "@/lib/utils";

interface TerminalLogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

const TerminalLogs = ({ logs, onClear }: TerminalLogsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'attacker':
        return 'text-orange-400';
      case 'target':
        return 'text-blue-400';
      case 'judge':
        return 'text-purple-400';
      case 'system':
        return 'text-muted-foreground';
      case 'error':
        return 'text-destructive';
      case 'success':
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  const getLogPrefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'attacker':
        return '[Attacker]';
      case 'target':
        return '[Target]';
      case 'judge':
        return '[Judge]';
      case 'system':
        return '[System]';
      case 'error':
        return '[Error]';
      case 'success':
        return '[Success]';
      default:
        return '[Log]';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="glass-card rounded-xl gradient-border overflow-hidden">
      <div 
        className="flex items-center justify-between px-4 py-3 bg-secondary/30 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-medium">Terminal Logs</span>
          <span className="text-xs text-muted-foreground">({logs.length} entries)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto bg-black/50 p-3 font-mono text-xs scrollbar-thin"
        >
          {logs.length === 0 ? (
            <div className="text-muted-foreground italic">
              Waiting for test execution...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="py-0.5 flex gap-2">
                <span className="text-muted-foreground/60">{formatTime(log.timestamp)}</span>
                <span className={cn("font-semibold", getLogColor(log.type))}>
                  {getLogPrefix(log.type)}
                </span>
                <span className={getLogColor(log.type)}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TerminalLogs;
