import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TestRun } from "@/types/test";
import { exportToJSON, exportToCSV } from "@/lib/export";

interface ExportButtonsProps {
  data: TestRun | TestRun[];
  filename: string;
  disabled?: boolean;
}

const ExportButtons = ({ data, filename, disabled }: ExportButtonsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border">
        <DropdownMenuItem 
          onClick={() => exportToJSON(data, filename)}
          className="cursor-pointer gap-2"
        >
          <FileJson className="w-4 h-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => exportToCSV(data, filename)}
          className="cursor-pointer gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButtons;
