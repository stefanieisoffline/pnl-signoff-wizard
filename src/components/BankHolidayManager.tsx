import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarOff, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { getBankHolidays, addBankHoliday, removeBankHoliday } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function BankHolidayManager() {
  const [holidays, setHolidays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHolidays(getBankHolidays());
  }, [open]);

  const handleAddHoliday = () => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Check if it's a weekend
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: 'Invalid Date',
        description: 'Weekends are already excluded from working days.',
        variant: 'destructive',
      });
      return;
    }
    
    if (holidays.includes(dateStr)) {
      toast({
        title: 'Already Added',
        description: 'This date is already marked as a bank holiday.',
        variant: 'destructive',
      });
      return;
    }
    
    addBankHoliday(dateStr);
    setHolidays(getBankHolidays());
    setSelectedDate(undefined);
    
    toast({
      title: 'Bank Holiday Added',
      description: `${format(selectedDate, 'PPP')} has been marked as a bank holiday.`,
    });
  };

  const handleRemoveHoliday = (dateStr: string) => {
    removeBankHoliday(dateStr);
    setHolidays(getBankHolidays());
    
    toast({
      title: 'Bank Holiday Removed',
      description: 'The date has been removed from bank holidays.',
    });
  };

  const sortedHolidays = [...holidays].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarOff className="h-4 w-4" />
          Bank Holidays
          {holidays.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {holidays.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Bank Holidays</DialogTitle>
          <DialogDescription>
            Mark dates as bank holidays. These dates will be excluded from working days.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("rounded-md border pointer-events-auto")}
              disabled={(date) => {
                const dayOfWeek = date.getDay();
                return dayOfWeek === 0 || dayOfWeek === 6;
              }}
            />
            <Button 
              onClick={handleAddHoliday} 
              disabled={!selectedDate}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Bank Holiday
            </Button>
          </div>
          
          {sortedHolidays.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Marked Bank Holidays</h4>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {sortedHolidays.map((dateStr) => (
                    <div 
                      key={dateStr}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="text-sm">
                        {format(new Date(dateStr), 'EEEE, d MMMM yyyy')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHoliday(dateStr)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
