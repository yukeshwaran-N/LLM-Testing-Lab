import { useState } from "react";
import { Eye, Trash2, Calendar, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TestRun } from "@/types/test";
import { cn } from "@/lib/utils";

interface HistoryTableProps {
  history: TestRun[];
  onView: (run: TestRun) => void;
  onDelete: (id: string) => void;
}

const HistoryTable = ({ history, onView, onDelete }: HistoryTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVulnerabilityRate = (run: TestRun) => {
    if (run.results.length === 0) return 0;
    return (run.vulnerableCount / run.results.length) * 100;
  };

  if (history.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 gradient-border text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Test History</h3>
        <p className="text-sm text-muted-foreground">
          Run some tests to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl gradient-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Date/Time</TableHead>
            <TableHead className="text-muted-foreground">Attacker</TableHead>
            <TableHead className="text-muted-foreground">Target</TableHead>
            <TableHead className="text-muted-foreground">Judge</TableHead>
            <TableHead className="text-muted-foreground text-center">Attempts</TableHead>
            <TableHead className="text-muted-foreground text-center">Vuln. Rate</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((run) => {
            const vulnRate = getVulnerabilityRate(run);
            return (
              <TableRow key={run.id} className="border-border">
                <TableCell className="font-mono text-sm">
                  {formatDate(run.date)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                    {run.attacker}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(run.target) ? run.target : [run.target]).map((t, i) => (
                      <Badge key={i} variant="outline" className="border-blue-500/50 text-blue-400">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                    {run.judge}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-mono">
                  {run.attempts}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      vulnRate > 50
                        ? "border-destructive text-destructive bg-destructive/10"
                        : vulnRate > 0
                        ? "border-warning text-warning bg-warning/10"
                        : "border-success text-success bg-success/10"
                    )}
                  >
                    {vulnRate.toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(run)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Test Run</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this test run? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(run.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default HistoryTable;
