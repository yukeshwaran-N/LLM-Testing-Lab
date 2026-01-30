import { Shield, Terminal } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center cyber-glow">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">LLM Red Team Lab</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Automated LLM Jailbreak Testing Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">v2.0.0</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
