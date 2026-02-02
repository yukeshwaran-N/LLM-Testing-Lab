// src/services/api.ts
import axios, { CancelTokenSource } from 'axios';
import { TestMetrics } from '@/types/test';
import { calculateTestMetrics } from '@/lib/analytics';

const API_BASE_URL = 'http://localhost:8000';

// Store current cancellation sources
let currentCancelSource: CancelTokenSource | null = null;
let currentTestId: string | null = null;

export interface AttackRequest {
    topic: string;
    attacker_model?: string;
    target_model?: string;
    judge_model?: string;
    max_attempts?: number;
}

export interface AttackResult {
    topic: string;
    success: boolean;
    attempts_made: number;
    total_attempts: number;
    verdict: string;
    vulnerability_reason?: string;
    duration_ms: number;
    all_attempts: Array<{
        attempt: number;
        attacker_prompt: string;
        attack_generated: string;
        target_response: string;
        judge_output: string;
        verdict: string;
        reason: string;
        success: boolean;
    }>;
    workflow: string;
    test_id?: string; // Add test_id for cancellation
}

// Add this type for compatibility
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
    attack_generated?: string;
    target_response?: string;
    judge_output?: string;
}

export interface Stats {
    overview: {
        total_tests: number;
        vulnerabilities_found: number;
        safe_responses: number;
        success_rate: number;
    };
    performance: {
        avg_attempts: number;
        avg_duration_ms: number;
    };
}

export interface HistoryItem {
    id: number;
    created_at: string;
    topic: string;
    models: {
        attacker: string;
        target: string;
        judge: string;
    };
    success: boolean;
    attempts: number;
    verdict: string;
    vulnerability?: string;
    duration_ms: number;
}

class RedTeamAPI {
    private client = axios.create({
        baseURL: API_BASE_URL,
        timeout: 1200000, // 20 minutes timeout for long-running tests
    });

    // Cancel any ongoing request
    cancelCurrentRequest() {
        if (currentCancelSource) {
            currentCancelSource.cancel('Operation cancelled by user');
            currentCancelSource = null;
        }
    }

    // Cancel backend process if possible
    async cancelBackendTest(testId?: string) {
        const idToCancel = testId || currentTestId;
        if (idToCancel) {
            try {
                await axios.post(`${API_BASE_URL}/api/n8n/cancel`, {
                    test_id: idToCancel
                }, {
                    timeout: 5000
                });
                console.log(`Cancelled backend test: ${idToCancel}`);
            } catch (error) {
                console.warn('Could not cancel backend process:', error);
                // Continue anyway - at least the frontend will stop
            } finally {
                currentTestId = null;
            }
        }

        // Also cancel the HTTP request
        this.cancelCurrentRequest();
        return true;
    }

    // Run attack (for ControlsPanel) - USE n8n/execute endpoint
    async runAttack(request: AttackRequest, options?: {
        onProgress?: (progress: number) => void;
        signal?: AbortSignal;
    }): Promise<AttackResult> {
        // Cancel any previous request
        this.cancelCurrentRequest();

        // Create new cancel source
        currentCancelSource = axios.CancelToken.source();

        try {
            const response = await this.client.post('/api/n8n/execute', request, {
                cancelToken: currentCancelSource.token,
                signal: options?.signal,
                onUploadProgress: (progressEvent) => {
                    if (options?.onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                        options.onProgress(progress);
                    }
                },
                onDownloadProgress: (progressEvent) => {
                    if (options?.onProgress && progressEvent.total) {
                        const progress = 50 + Math.round((progressEvent.loaded * 50) / progressEvent.total);
                        options.onProgress(progress);
                    }
                }
            });

            // Store test ID if returned
            if (response.data.test_id) {
                currentTestId = response.data.test_id;
            }

            return response.data;
        } catch (error: any) {
            if (axios.isCancel(error)) {
                console.log('Request cancelled:', error.message);
                throw new Error('Test cancelled by user');
            }
            throw error;
        } finally {
            currentCancelSource = null;
        }
    }

    // Stream attack (for real-time updates)
    async streamAttack(request: AttackRequest, onUpdate: (data: any) => void) {
        // Cancel any previous request
        this.cancelCurrentRequest();

        const controller = new AbortController();
        currentCancelSource = axios.CancelToken.source();

        try {
            const response = await fetch(`${API_BASE_URL}/api/n8n/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
                signal: controller.signal,
            });

            // Store test ID from headers if available
            const testId = response.headers.get('X-Test-ID');
            if (testId) {
                currentTestId = testId;
            }

            const reader = response.body?.getReader();
            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            onUpdate(data);
                        } catch (e) {
                            console.error('Error parsing stream data:', e);
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream cancelled');
            } else {
                throw error;
            }
        } finally {
            currentCancelSource = null;
        }
    }

    // Get history (for HistoryTable) - USE correct endpoint
    async getAttackHistory(limit: number = 50): Promise<HistoryItem[]> {
        try {
            const response = await this.client.get(`/api/history?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch history:', error);
            return [];
        }
    }

    // Get stats (for StatsCards) - USE correct endpoint
    async getStatistics(): Promise<Stats> {
        try {
            const response = await this.client.get('/api/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return {
                overview: {
                    total_tests: 0,
                    vulnerabilities_found: 0,
                    safe_responses: 0,
                    success_rate: 0,
                },
                performance: {
                    avg_attempts: 0,
                    avg_duration_ms: 0,
                },
            };
        }
    }

    // Check if backend is running
    async checkHealth(): Promise<boolean> {
        try {
            const response = await axios.get(`${API_BASE_URL}/health`, {
                timeout: 5000
            });
            return response.data.status === 'healthy';
        } catch {
            return false;
        }
    }

    // Add this method for advanced metrics
    async calculateAdvancedMetrics(results: TestResult[]): Promise<TestMetrics> {
        return calculateTestMetrics(results);
    }

    // Clear current test state
    clearCurrentTest() {
        currentTestId = null;
        this.cancelCurrentRequest();
    }

    // Get current test ID (for debugging)
    getCurrentTestId(): string | null {
        return currentTestId;
    }
}

export const api = new RedTeamAPI();