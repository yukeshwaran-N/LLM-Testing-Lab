import { N8NIntegration } from "@/components/N8NIntegration";

export default function N8NDashboard() {
    return (
        <div className="p-4 md:p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-center">
                    🔥 LLM Testing Lab with n8n Integration
                </h1>
                <p className="text-center text-gray-400 mt-2">
                    Automated security testing powered by n8n workflows
                </p>
            </header>

            <main className="max-w-6xl mx-auto">
                <N8NIntegration />
            </main>
        </div>
    );
}