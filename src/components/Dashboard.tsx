import { useState } from "react";
import { N8NIntegration } from "@/components/N8NIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("llm");

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-center">
                    🔥 LLM Security Testing Lab
                </h1>
                <p className="text-center text-gray-400 mt-2">
                    Automated security testing platform with n8n integration
                </p>
            </header>

            <main className="max-w-7xl mx-auto">
                <Tabs defaultValue="llm" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                        <TabsTrigger value="llm">LLM Red Team Lab</TabsTrigger>
                        <TabsTrigger value="n8n">n8n Workflows</TabsTrigger>
                    </TabsList>

                    <TabsContent value="llm" className="space-y-4">
                        {/* LLM Red Team Lab Content */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2">LLM Red Team Lab</h2>
                                <p className="text-gray-400">Automated LLM Jailbreak Testing Platform</p>
                            </div>
                            {/* Your LLM Red Team components here */}
                            <div className="text-center text-gray-500 py-8">
                                LLM Red Team Lab Content
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="n8n" className="space-y-4">
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <N8NIntegration />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Status Footer */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                            v2.0.0
                        </span>
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">
                            System Online
                        </span>
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                            Backend: Connected
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}