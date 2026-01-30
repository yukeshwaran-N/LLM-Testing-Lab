import { Shield, Terminal } from "lucide-react";

const Navbar = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-foreground">LLM Red Team</span>
              <span className="text-primary">Lab</span>
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              Automated LLM Jailbreak Testing Dashboard
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
