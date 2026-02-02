// src/components/N8NWorkflowPanel.tsx
import React, { useState } from 'react';
import { n8nApi } from '../services/n8nApi';

export const N8NWorkflowPanel: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<any>(null);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 50)]);
    };

    const runN8NWorkflow = async () => {
        setIsRunning(true);
        setLogs([]);
        setResult(null);

        addLog('🚀 Starting n8n workflow replication...');
        addLog(`📝 Topic: "${topic}"`);
        addLog('🔄 Models: dolphin-mistral → gemma:2b → phi3:mini');

        try {
            // Stream execution
            await n8nApi.streamWorkflow(topic, (event) => {
                switch (event.type) {
                    case 'workflow_start':
                        addLog(`⚙️ Starting workflow (max attempts: ${event.max_attempts})`);
                        break;
                    case 'attempt_start':
                        addLog(`🔍 Attempt ${event.attempt}/${event.total_attempts}`);
                        break;
                    case 'attacker_generated':
                        addLog(`🤖 Attacker generated: ${event.response.substring(0, 80)}...`);
                        break;
                    case 'target_response':
                        addLog(`🎯 Target response: ${event.response.substring(0, 80)}...`);
                        break;
                    case 'judge_verdict':
                        addLog(`⚖️ Judge verdict: ${event.verdict} - ${event.reason}`);
                        if (event.is_vulnerable) {
                            addLog('💥 VULNERABILITY FOUND!');
                        }
                        break;
                    case 'workflow_complete':
                        addLog(event.success ?
                            `✅ Workflow complete - VULNERABLE found in ${event.attempts_made} attempts` :
                            `✅ Workflow complete - SAFE after ${event.attempts_made} attempts`
                        );
                        setIsRunning(false);
                        break;
                }
            });
        } catch (error) {
            addLog(`❌ Error: ${error}`);
            setIsRunning(false);
        }
    };

    const loadN8NHistory = async () => {
        const results = await n8nApi.getN8NResults();
        setResult({ history: results });
    };

    return (
        <div className="border rounded-lg p-4 bg-gray-900">
            <h2 className="text-xl font-bold mb-4 text-green-400">
                🔄 n8n Workflow Replication
            </h2>

            <div className="mb-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic to test..."
                    className="w-full p-2 border rounded bg-gray-800 text-white"
                    disabled={isRunning}
                />
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={runN8NWorkflow}
                    disabled={!topic || isRunning}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {isRunning ? 'Running n8n Workflow...' : 'Run n8n Workflow'}
                </button>

                <button
                    onClick={loadN8NHistory}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Load n8n History
                </button>
            </div>

            {logs.length > 0 && (
                <div className="mt-4 p-3 bg-black rounded font-mono text-sm h-64 overflow-y-auto">
                    {logs.map((log, idx) => (
                        <div key={idx} className="mb-1 text-gray-300">
                            {log}
                        </div>
                    ))}
                </div>
            )}

            {result && (
                <div className="mt-4 p-3 bg-gray-800 rounded">
                    <h3 className="font-bold mb-2">Results</h3>
                    <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};