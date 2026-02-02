// src/services/n8nService.ts
export interface N8NWorkflowRequest {
    topic: string;
    max_attempts?: number;
    attacker_model?: string;
    target_model?: string;
    judge_model?: string;
}

export interface N8NWorkflowResult {
    topic: string;
    success: boolean;
    attempts_made: number;
    total_attempts: number;
    verdict: string;
    vulnerability_reason?: string;
    duration_ms: number;
    all_attempts: any[];
    workflow: string;
}

export interface N8NStreamEvent {
    type: string;
    attempt?: number;
    max_attempts?: number;
    total_attempts?: number;
    prompt?: string;
    response?: string;
    verdict?: string;
    reason?: string;
    success?: boolean;
    timestamp?: string;
    topic?: string;
    vulnerability_reason?: string;
}

class N8NService {
    private baseUrl = 'http://localhost:8000/api/n8n';

    async executeWorkflow(request: N8NWorkflowRequest): Promise<N8NWorkflowResult> {
        const response = await fetch(`${this.baseUrl}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...request,
                attacker_model: request.attacker_model || 'dolphin-mistral:latest',
                target_model: request.target_model || 'gemma:2b',
                judge_model: request.judge_model || 'phi3:mini',
                max_attempts: request.max_attempts || 5
            }),
        });

        if (!response.ok) {
            throw new Error(`n8n workflow failed: ${response.statusText}`);
        }

        return response.json();
    }

    async streamWorkflow(
        request: N8NWorkflowRequest,
        onEvent: (event: N8NStreamEvent) => void
    ): Promise<void> {
        const response = await fetch(`${this.baseUrl}/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...request,
                attacker_model: request.attacker_model || 'dolphin-mistral:latest',
                target_model: request.target_model || 'gemma:2b',
                judge_model: request.judge_model || 'phi3:mini',
                max_attempts: request.max_attempts || 5
            }),
        });

        if (!response.ok) {
            throw new Error(`Stream failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const event = JSON.parse(line.slice(6));
                        onEvent(event);
                    } catch (e) {
                        console.error('Failed to parse stream event:', e);
                    }
                }
            }
        }
    }

    async getWorkflowInfo() {
        // Return info about your backend implementation
        return {
            name: "LLM Jailbreak Testing Workflow",
            version: "1.0.0",
            description: "Attacker → Target → Judge pattern with Ollama models",
            models: {
                attacker: "dolphin-mistral:latest",
                target: "gemma:2b",
                judge: "phi3:mini"
            },
            endpoints: {
                execute: "/api/n8n/execute",
                stream: "/api/n8n/stream",
                history: "/api/history",
                stats: "/api/stats"
            }
        };
    }

    async getResults(limit: number = 20) {
        const response = await fetch(`http://localhost:8000/api/history?limit=${limit}`);
        return response.json();
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:8000/health');
            return response.ok;
        } catch {
            return false;
        }
    }
}

export const n8nService = new N8NService();