// src/components/MultiModelSelector.tsx
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Define the props interface
export interface MultiModelSelectorProps {
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  availableModels: { value: string; label: string }[];
  disabled?: boolean;
}

const MultiModelSelector = ({
  selectedModels,
  onModelsChange,
  availableModels,
  disabled = false,
}: MultiModelSelectorProps) => {
  const [open, setOpen] = useState(false);

  const toggleModel = (modelValue: string) => {
    if (selectedModels.includes(modelValue)) {
      onModelsChange(selectedModels.filter((model) => model !== modelValue));
    } else {
      onModelsChange([...selectedModels, modelValue]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Target Models</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedModels.map((modelValue) => {
          const model = availableModels.find((m) => m.value === modelValue);
          return (
            <Badge
              key={modelValue}
              variant="secondary"
              className="px-3 py-1"
              onClick={() => toggleModel(modelValue)}
            >
              {model?.label || modelValue}
              <button
                className="ml-2 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModel(modelValue);
                }}
              >
                ×
              </button>
            </Badge>
          );
        })}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            Select models...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {availableModels.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={() => toggleModel(model.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedModels.includes(model.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {model.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        {selectedModels.length} model(s) selected
      </p>
    </div>
  );
};

export default MultiModelSelector;