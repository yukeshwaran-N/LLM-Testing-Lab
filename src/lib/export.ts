import { TestRun, TestResult } from "@/types/test";

export const exportToJSON = (data: TestRun | TestRun[], filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  downloadBlob(blob, `${filename}.json`);
};

export const exportToCSV = (data: TestRun | TestRun[], filename: string) => {
  const runs = Array.isArray(data) ? data : [data];
  
  const headers = [
    "Run ID",
    "Date",
    "Attacker",
    "Target",
    "Judge",
    "Attempt",
    "Verdict",
    "Reason",
    "Attack Prompt",
    "Model Response"
  ];
  
  const rows: string[][] = [];
  
  runs.forEach(run => {
    run.results.forEach(result => {
      rows.push([
        run.id,
        new Date(run.date).toLocaleString(),
        run.attacker,
        Array.isArray(run.target) ? run.target.join("; ") : run.target,
        run.judge,
        result.attempt.toString(),
        result.verdict,
        `"${result.reason.replace(/"/g, '""')}"`,
        `"${result.attack_prompt.replace(/"/g, '""')}"`,
        `"${result.model_response.replace(/"/g, '""')}"`
      ]);
    });
  });
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
