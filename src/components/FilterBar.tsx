import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { desks } from '@/lib/mockData';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDesk: string;
  onDeskChange: (desk: string) => void;
  showRetired: boolean;
  onShowRetiredChange: (show: boolean) => void;
  hideRetiredToggle?: boolean;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedDesk,
  onDeskChange,
  showRetired,
  onShowRetiredChange,
  hideRetiredToggle = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search books, traders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-muted/30 border-border"
        />
      </div>

      <Select value={selectedDesk} onValueChange={onDeskChange}>
        <SelectTrigger className="w-[180px] bg-muted/30 border-border">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="All Desks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Desks</SelectItem>
          {desks.map((desk) => (
            <SelectItem key={desk} value={desk}>
              {desk}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!hideRetiredToggle && (
        <Button
          variant={showRetired ? 'secondary' : 'outline'}
          onClick={() => onShowRetiredChange(!showRetired)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showRetired ? 'Hide Retired' : 'Show Retired'}
        </Button>
      )}
    </div>
  );
}
