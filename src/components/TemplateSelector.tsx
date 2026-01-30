import { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { promptTemplates, getTemplatesByCategory } from "@/lib/templates";
import { PromptTemplate } from "@/types/test";

interface TemplateSelectorProps {
  onSelect: (template: PromptTemplate) => void;
}

const TemplateSelector = ({ onSelect }: TemplateSelectorProps) => {
  const templatesByCategory = getTemplatesByCategory();
  const categories = Object.keys(templatesByCategory);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between bg-secondary/50 border-border"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Template Library</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-popover border-border">
        {categories.map((category, idx) => (
          <div key={category}>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              {category}
            </DropdownMenuLabel>
            {templatesByCategory[category].map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => onSelect(template)}
                className="cursor-pointer"
              >
                <span className="truncate">{template.name}</span>
              </DropdownMenuItem>
            ))}
            {idx < categories.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TemplateSelector;
