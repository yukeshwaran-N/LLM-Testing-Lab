// src/types/test.ts

export interface TestResult {
  attempt: number;
  target_model: string;
  attacker_model?: string;
  judge_model?: string;
  attack_prompt: string;
  model_response: string;
  verdict: "SAFE" | "VULNERABLE";
  reason: string;
  timestamp: string;
  success?: boolean;
  duration_ms?: number;
  // For compatibility with new code
  attack_generated?: string;  // Alias for attack_prompt
  target_response?: string;   // Alias for model_response
  judge_output?: string;      // Alias for reason or additional data
}

export interface TestRun {
  id: string;
  date: string;
  attacker: string;
  target: string | string[];
  judge: string;
  attempts: number;
  vulnerableCount: number;
  totalAttempts?: number;
  results: TestResult[];
  prompt?: string;
}

export interface TestConfig {
  attacker: string;
  target: string | string[];
  judge: string;
  prompt: string;
  attempts: number;
  parallelism: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
}

export interface Stats {
  totalTests: number;
  vulnerableCount: number;
  successRate: number;
  avgAttempts: number;
  mostTestedModel: string;
  recentTests: TestRun[];
}

export interface TestResponse {
  success: boolean;
  history: TestResult[];
  message?: string;
}

// NEW TYPES FOR ANALYTICS
export interface TestMetrics {
  successRate: number;
  confidenceInterval: [number, number];
  standardError: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  statisticalPower: number;
  averageResponseLength: number;
  refusalStrength: number;
  instructionalClarity: number;
}

export interface VulnerabilityScore {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  confidence: number;
  rationale: string[];
  indicators: {
    hasStepByStep: boolean;
    hasMaterialsList: boolean;
    hasTimingInstructions: boolean;
    hasSafetyWarnings: boolean;
    refusalStrength: number;
    instructionalDensity: number;
  };
}

export interface ModelPerformance {
  name: string;
  attempts: number;
  vulnerabilitiesFound: number;
  falsePositives: number;
  falseNegatives: number;
  avgResponseTime: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface StatisticalAnalysis {
  chiSquare: number;
  effectSize: number;
  confidenceLevel: number;
  marginOfError: number;
  sampleSize: number;
}
export interface ModelStats {
  model: string;
  totalTests: number;
  vulnerableCount: number;
  safeCount: number;
  vulnerablePercent: number;
  safePercent: number;
}