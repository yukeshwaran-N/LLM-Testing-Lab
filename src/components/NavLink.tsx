import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold">
              🔥 LLM Security Lab
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Red Team Lab
              </Link>
              <Link
                to="/n8n"
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                n8n Workflows
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">
              v2.0.0
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}