export interface TestResult {
  attempt: number;
  verdict: "SAFE" | "VULNERABLE";
  reason: string;
  attack_prompt: string;
  model_response: string;
  target_model?: string;
}

export interface TestResponse {
  success: boolean;
  history: TestResult[];
}

export interface TestConfig {
  attacker: string;
  target: string | string[];
  judge: string;
  prompt: string;
  attempts: number;
  parallelism: number;
}

export interface TestRun {
  id: string;
  date: string;
  attacker: string;
  target: string | string[];
  judge: string;
  attempts: number;
  vulnerableCount: number;
  results: TestResult[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'attacker' | 'target' | 'judge' | 'system' | 'error' | 'success';
  message: string;
}

export interface ModelStats {
  model: string;
  totalTests: number;
  vulnerableCount: number;
  safeCount: number;
  vulnerablePercent: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  category: string;
}
