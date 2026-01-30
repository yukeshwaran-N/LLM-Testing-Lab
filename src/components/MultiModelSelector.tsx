import { useState } from "react";
import { Target, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MultiModelSelectorProps {
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
}

const availableModels = [
  { value: "gemma:2b", label: "Gemma 2B" },
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "llama3", label: "Llama 3" },
  { value: "mistral", label: "Mistral" },
  { value: "codellama", label: "Code Llama" },
];

const MultiModelSelector = ({ selectedModels, onModelsChange }: MultiModelSelectorProps) => {
  const [open, setOpen] = useState(false);

  const toggleModel = (value: string) => {
    if (selectedModels.includes(value)) {
      onModelsChange(selectedModels.filter(m => m !== value));
    } else {
      onModelsChange([...selectedModels, value]);
    }
  };

  const removeModel = (value: string) => {
    onModelsChange(selectedModels.filter(m => m !== value));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Target className="w-4 h-4 text-warning" />
        Target Models
        <span className="text-xs text-muted-foreground">(multi-select)</span>
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-secondary/50 border-border min-h-[42px] h-auto py-2"
          >
            {selectedModels.length === 0 ? (
              <span className="text-muted-foreground">Select target models...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedModels.map(model => (
                  <Badge
                    key={model}
                    variant="secondary"
                    className="gap-1 bg-primary/20"
                  >
                    {availableModels.find(m => m.value === model)?.label || model}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeModel(model);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 bg-popover border-border">
          <div className="space-y-1">
            {availableModels.map(model => (
              <div
                key={model.value}
                className="flex items-center space-x-2 p-2 rounded hover:bg-secondary/50 cursor-pointer"
                onClick={() => toggleModel(model.value)}
              >
                <Checkbox
                  checked={selectedModels.includes(model.value)}
                  onCheckedChange={() => toggleModel(model.value)}
                />
                <span className="text-sm">{model.label}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiModelSelector;
