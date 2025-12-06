import { Book, formatWorkingDay, getLastWorkingDays } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { MessageSquare, User, Users } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SignOffGridProps {
  books: Book[];
  onBookClick: (book: Book, selectedDate?: string) => void;
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
                Team
              </th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => {
              const commentsCount = book.comments.length;
              
              return (
                <tr
                  key={book.id}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/20',
                    book.isRetired && 'opacity-50'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td 
                    className="sticky left-0 z-10 bg-card px-4 py-3 cursor-pointer"
                    onClick={() => onBookClick(book)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{book.name}</span>
                      {book.isRetired && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          RETIRED
                        </span>
                      )}
                      {commentsCount > 0 && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {commentsCount}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td 
                    className="px-4 py-3 text-sm text-muted-foreground cursor-pointer"
                    onClick={() => onBookClick(book)}
                  >
                    {book.desk}
                  </td>
                  {workingDays.map((day) => {
                    const signOff = book.signOffs.find(s => s.date === day);
                    const commentsForDate = book.comments.filter(c => c.date === day);
                    
                    return (
                      <td key={day} className="px-3 py-3 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="relative inline-flex justify-center cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookClick(book, day);
                              }}
                            >
                              <div className="transition-transform group-hover:scale-110">
                                <StatusBadge status={signOff?.status || 'none'} size="sm" />
                              </div>
                              {commentsForDate.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                                  {commentsForDate.length}
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{formatWorkingDay(day)}</p>
                            {commentsForDate.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {commentsForDate.length} comment{commentsForDate.length > 1 ? 's' : ''}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Click to view</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3" onClick={() => onBookClick(book)}>
                    <div className="flex flex-col gap-1.5 cursor-pointer">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-sm">
                            <User className="h-3.5 w-3.5 text-primary" />
                            <span className="text-foreground truncate max-w-[120px]">{book.primaryTrader}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Primary Trader</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground truncate max-w-[120px]">{book.secondaryTrader}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Secondary Trader</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground truncate max-w-[120px]">{book.deskHead}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Desk Head</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
