import { Book, getLastWorkingDays, formatWorkingDay } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { Check, X, User } from 'lucide-react';
import { Badge } from './ui/badge';

interface TraderSignOffGridProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onQuickSignOff: (book: Book, date: string) => void;
  traderName: string;
}

export function TraderSignOffGrid({ books, onBookClick, onQuickSignOff, traderName }: TraderSignOffGridProps) {
  const workingDays = getLastWorkingDays(5);

  const handleQuickSign = (e: React.MouseEvent, book: Book, date: string) => {
    e.stopPropagation();
    onQuickSignOff(book, date);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left text-sm font-semibold text-foreground">
              Book Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Desk
            </th>
            {workingDays.map((day) => (
              <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                {formatWorkingDay(day)}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => {
            const todaySignOff = book.signOffs.find(s => s.date === workingDays[0]);
            const isPrimary = book.primaryTrader === traderName;
            const canSign = todaySignOff?.status === 'pending';

            return (
              <tr
                key={book.id}
                onClick={() => onBookClick(book)}
                className="cursor-pointer border-b border-border transition-colors hover:bg-muted/30"
              >
                <td className="sticky left-0 z-10 bg-card px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{book.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={isPrimary ? "default" : "secondary"} className="text-xs">
                    <User className="mr-1 h-3 w-3" />
                    {isPrimary ? 'Primary' : 'Secondary'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {book.desk}
                </td>
                {workingDays.map((day) => {
                  const signOff = book.signOffs.find((s) => s.date === day);
                  return (
                    <td key={day} className="px-4 py-3 text-center">
                      <StatusBadge status={signOff?.status || 'none'} />
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  {canSign ? (
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={(e) => handleQuickSign(e, book, workingDays[0])}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookClick(book);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
