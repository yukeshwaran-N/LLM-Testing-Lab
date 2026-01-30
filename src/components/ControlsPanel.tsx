import { Play, Loader2, Zap, Scale, Cpu } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TestConfig, PromptTemplate } from "@/types/test";
import TemplateSelector from "./TemplateSelector";
import MultiModelSelector from "./MultiModelSelector";

interface ControlsPanelProps {
  config: TestConfig;
  onConfigChange: (config: Partial<TestConfig>) => void;
  onRunTest: () => void;
  isLoading: boolean;
}

const attackerModels = [
  { value: "dolphin-mistral", label: "Dolphin Mistral" },
  { value: "llama3", label: "Llama 3" },
  { value: "mixtral", label: "Mixtral" },
];

const judgeModels = [
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "dolphin-mistral", label: "Dolphin Mistral" },
];

const ControlsPanel = ({
  config,
  onConfigChange,
  onRunTest,
  isLoading,
}: ControlsPanelProps) => {
  const handleTemplateSelect = (template: PromptTemplate) => {
    onConfigChange({ prompt: template.prompt });
  };

  const targetModels = Array.isArray(config.target) ? config.target : [config.target];

  return (
    <div className="space-y-5 animate-slide-in-left">
      {/* Template Selector */}
      <TemplateSelector onSelect={handleTemplateSelect} />

      {/* Test Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Test Prompt
        </Label>
        <Textarea
          id="prompt"
          placeholder="Enter attack topic or scenario..."
          value={config.prompt}
          onChange={(e) => onConfigChange({ prompt: e.target.value })}
          className="min-h-[100px] resize-none bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 font-mono text-sm"
        />
      </div>

      {/* Model Selectors */}
      <div className="grid gap-4">
        {/* Attacker Model */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-destructive" />
            Attacker Model
          </Label>
          <Select
            value={config.attacker}
            onValueChange={(value) => onConfigChange({ attacker: value })}
          >
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select attacker model" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {attackerModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Models (Multi-select) */}
        <MultiModelSelector
          selectedModels={targetModels}
          onModelsChange={(models) => onConfigChange({ target: models.length === 1 ? models[0] : models })}
        />

        {/* Judge Model */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Judge Model
          </Label>
          <Select
            value={config.judge}
            onValueChange={(value) => onConfigChange({ judge: value })}
          >
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select judge model" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {judgeModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attempts Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Attempts</Label>
          <span className="text-sm font-mono text-primary font-semibold">
            {config.attempts}
          </span>
        </div>
        <Slider
          value={[config.attempts]}
          onValueChange={([value]) => onConfigChange({ attempts: value })}
          min={1}
          max={10}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      {/* Parallelism Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Cpu className="w-4 h-4 text-warning" />
            Parallelism
          </Label>
          <span className="text-sm font-mono text-warning font-semibold">
            {config.parallelism}
          </span>
        </div>
        <Slider
          value={[config.parallelism]}
          onValueChange={([value]) => onConfigChange({ parallelism: value })}
          min={1}
          max={5}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>5</span>
        </div>
      </div>

      {/* Run Button */}
      <Button
        onClick={onRunTest}
        disabled={isLoading || !config.prompt.trim() || (Array.isArray(config.target) ? config.target.length === 0 : !config.target)}
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cyber-glow transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Running Test...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Run Test
          </>
        )}
      </Button>
    </div>
  );
};

export default ControlsPanel;
