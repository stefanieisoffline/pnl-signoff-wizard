import { Book, formatWorkingDay, getLastWorkingDays } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface SignOffGridProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

export function SignOffGrid({ books, onBookClick }: SignOffGridProps) {
  const workingDays = getLastWorkingDays(5);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="sticky left-0 z-10 bg-muted/30 px-4 py-3 text-left text-sm font-semibold text-foreground">
                Book Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Desk
              </th>
              {workingDays.map((day) => (
                <th key={day} className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">
                  {formatWorkingDay(day)}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Primary Trader
              </th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr
                key={book.id}
                onClick={() => onBookClick(book)}
                className={cn(
                  'cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/20',
                  book.isRetired && 'opacity-50'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="sticky left-0 z-10 bg-card px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{book.name}</span>
                    {book.isRetired && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        RETIRED
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {book.desk}
                </td>
                {workingDays.map((day) => {
                  const signOff = book.signOffs.find(s => s.date === day);
                  return (
                    <td key={day} className="px-3 py-3 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={signOff?.status || 'none'} size="sm" />
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {book.primaryTrader}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
