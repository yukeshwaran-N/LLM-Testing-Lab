// src/services/n8nApi.ts
export const n8nApi = {
    async executeWorkflow(topic: string, models: any = {}) {
        const response = await fetch('http://localhost:8000/api/n8n/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                attacker_model: models.attacker || 'dolphin-mistral:latest',
                target_model: models.target || 'gemma:2b',
                judge_model: models.judge || 'phi3:mini',
                max_attempts: models.max_attempts || 5
            }),
        });
        return response.json();
    },

    async streamWorkflow(topic: string, onUpdate: (data: any) => void) {
        const response = await fetch('http://localhost:8000/api/n8n/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                attacker_model: 'dolphin-mistral:latest',
                target_model: 'gemma:2b',
                judge_model: 'phi3:mini',
                max_attempts: 5
            }),
        });

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        onUpdate(data);
                    } catch (e) {
                        console.error('Error parsing n8n stream:', e);
                    }
                }
            }
        }
    },

    async getN8NResults(limit: number = 20) {
        const response = await fetch(`http://localhost:8000/api/history?limit=${limit}`);
        return response.json();
    },

    async compareWorkflows() {
        // This might not exist yet, create a simple one
        try {
            const response = await fetch('http://localhost:8000/api/stats');
            return response.json();
        } catch {
            return { overview: { total_tests: 0 } };
        }
    }
};