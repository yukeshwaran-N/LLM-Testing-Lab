export interface TestResult {
  attempt: number;
  verdict: "SAFE" | "VULNERABLE";
  reason: string;
  attack_prompt: string;
  model_response: string;
}

export interface TestResponse {
  success: boolean;
  history: TestResult[];
}

export interface TestConfig {
  attacker: string;
  target: string;
  judge: string;
  prompt: string;
  attempts: number;
}
