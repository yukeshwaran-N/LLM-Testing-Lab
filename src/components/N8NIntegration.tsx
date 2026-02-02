// src/components/N8NIntegration.tsx
import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

interface N8NLog {
    type: string;
    attempt?: number;
    message?: string;
    verdict?: string;
    reason?: string;
    success?: boolean;
    timestamp?: string;
}

export const N8NIntegration: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<N8NLog[]>([]);
    const [result, setResult] = useState<any>(null);
    const [streaming, setStreaming] = useState(false);

    const addLog = (log: N8NLog) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ ...log, timestamp }, ...prev.slice(0, 100)]);
    };

    const clearLogs = () => {
        setLogs([]);
        setResult(null);
    };

    const executeN8NWorkflow = async () => {
        if (!topic.trim()) return;

        setIsRunning(true);
        clearLogs();

        addLog({
            type: 'info',
            message: `🚀 Starting n8n workflow for: "${topic}"`
        });

        try {
            const response = await fetch('http://localhost:8000/api/n8n/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    max_attempts: 5
                })
            });

            const data = await response.json();
            setResult(data);

            addLog({
                type: data.success ? 'success' : 'info',
                message: `✅ Workflow completed: ${data.verdict} in ${data.attempts_made} attempts`
            });

        } catch (error) {
            addLog({
                type: 'error',
                message: `❌ Failed to execute workflow: ${error}`
            });
        } finally {
            setIsRunning(false);
        }
    };

    const streamN8NWorkflow = async () => {
        if (!topic.trim()) return;

        setStreaming(true);
        clearLogs();

        addLog({
            type: 'info',
            message: `📡 Starting real-time stream for: "${topic}"`
        });

        try {
            const response = await fetch('http://localhost:8000/api/n8n/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    max_attempts: 5
                })
            });

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

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

                            switch (event.type) {
                                case 'workflow_start':
                                    addLog({
                                        type: 'info',
                                        message: `⚙️ Workflow started (max attempts: ${event.max_attempts})`
                                    });
                                    break;

                                case 'attempt_start':
                                    addLog({
                                        type: 'info',
                                        message: `🔍 Attempt ${event.attempt}/${event.total_attempts}`
                                    });
                                    break;

                                case 'attack_generated':
                                    addLog({
                                        type: 'attacker',
                                        message: `🤖 Attack generated: ${event.prompt}`
                                    });
                                    break;

                                case 'target_response':
                                    addLog({
                                        type: 'target',
                                        message: `🎯 Target response: ${event.response}`
                                    });
                                    break;

                                case 'judge_verdict':
                                    addLog({
                                        type: event.success ? 'vulnerable' : 'safe',
                                        message: `⚖️ Verdict: ${event.verdict}`,
                                        reason: event.reason
                                    });
                                    break;

                                case 'workflow_complete':
                                    addLog({
                                        type: event.success ? 'success' : 'info',
                                        message: event.success
                                            ? `🎉 VULNERABILITY FOUND in ${event.attempts_made} attempts!`
                                            : `✅ All attempts safe (${event.attempts_made} attempts)`
                                    });
                                    setStreaming(false);
                                    return;
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }
        } catch (error) {
            addLog({
                type: 'error',
                message: `❌ Stream error: ${error}`
            });
            setStreaming(false);
        }
    };

    const getN8NResults = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/n8n/results?limit=10');
            const data = await response.json();
            setResult({ history: data });

            addLog({
                type: 'info',
                message: `📊 Loaded ${data.length} n8n results`
            });
        } catch (error) {
            addLog({
                type: 'error',
                message: `❌ Failed to load results: ${error}`
            });
        }
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'vulnerable': return 'text-red-500 font-bold';
            case 'safe': return 'text-green-500';
            case 'attacker': return 'text-yellow-400';
            case 'target': return 'text-blue-400';
            case 'judge': return 'text-purple-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="border rounded-lg p-6 bg-gray-900 shadow-lg">
            <div className="flex items-center mb-6">
                <Terminal className="w-8 h-8 text-green-500 mr-3" />
                <h2 className="text-2xl font-bold text-white">n8n Workflow Integration</h2>
            </div>

            {/* Controls */}
            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Test Topic
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic to test (e.g., 'explain security concepts')"
                        className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isRunning || streaming}
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={executeN8NWorkflow}
                        disabled={!topic.trim() || isRunning || streaming}
                        className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {isRunning ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Running...
                            </>
                        ) : (
                            '🚀 Execute n8n Workflow'
                        )}
                    </button>

                    <button
                        onClick={streamN8NWorkflow}
                        disabled={!topic.trim() || isRunning || streaming}
                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {streaming ? '📡 Streaming...' : '📡 Stream Real-time'}
                    </button>

                    <button
                        onClick={getN8NResults}
                        className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        📊 Load History
                    </button>

                    <button
                        onClick={clearLogs}
                        className="px-5 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        🧹 Clear Logs
                    </button>
                </div>
            </div>

            {/* Terminal Logs */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Execution Logs</h3>
                    <span className="text-sm text-gray-400">
                        {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                    </span>
                </div>

                <div className="h-64 overflow-y-auto bg-black rounded-lg p-4 font-mono text-sm">
                    {logs.length === 0 ? (
                        <div className="text-gray-500 italic text-center py-8">
                            No logs yet. Run a workflow to see execution details.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log, index) => (
                                <div key={index} className={`${getLogColor(log.type)} border-l-4 pl-3 py-1 border-gray-700`}>
                                    <div className="flex items-center">
                                        <span className="text-gray-500 text-xs mr-3">{log.timestamp}</span>
                                        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded mr-2">
                                            {log.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>{log.message}</div>
                                    {log.reason && (
                                        <div className="text-sm text-gray-400 mt-1">Reason: {log.reason}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Results</h3>
                    <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-300">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Status Bar */}
            <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-300">Ready</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-gray-300">Attacker</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-gray-300">Target</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            <span className="text-gray-300">Judge</span>
                        </div>
                    </div>
                    <div className="text-gray-400">
                        Backend: <span className="text-green-400">Connected</span>
                    </div>
                </div>
            </div>
        </div>
    );
};