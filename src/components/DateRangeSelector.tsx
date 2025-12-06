import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangeSelectorProps {
  value: number;
  onChange: (days: number) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">Last 5 days</SelectItem>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="10">Last 10 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
