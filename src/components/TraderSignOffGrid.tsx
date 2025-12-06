import { useState } from 'react';
import { Book, getLastWorkingDays, formatWorkingDay, BookComment } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { Check, X, User, MessageSquare, Send } from 'lucide-react';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { toast } from '@/hooks/use-toast';

interface TraderSignOffGridProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  traderName: string;
  daysToShow?: number;
}

export function TraderSignOffGrid({ books, onBookClick, onUpdateBook, traderName, daysToShow = 5 }: TraderSignOffGridProps) {
  const workingDays = getLastWorkingDays(daysToShow);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const handleSignOff = (book: Book, date: string, action: 'sign' | 'reject') => {
    const updatedSignOffs = book.signOffs.map(s =>
      s.date === date
        ? {
            ...s,
            status: action === 'sign' ? 'signed' as const : 'rejected' as const,
            signedBy: traderName,
            signedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          }
        : s
    );

    // Add comment if provided
    let updatedComments = book.comments;
    if (comment.trim()) {
      const newComment: BookComment = {
        id: `comment-${Date.now()}`,
        bookId: book.id,
        date,
        authorName: traderName,
        authorRole: book.deskHead === traderName ? 'desk_head' : 'trader',
        content: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      updatedComments = [...book.comments, newComment];
    }

    onUpdateBook({ ...book, signOffs: updatedSignOffs, comments: updatedComments });
    setOpenPopover(null);
    setComment('');
    
    toast({
      title: action === 'sign' ? 'Report Signed' : 'Report Rejected',
      description: `${book.name} - ${formatWorkingDay(date)}`,
      variant: action === 'sign' ? 'default' : 'destructive',
    });
  };

  const getPopoverKey = (bookId: string, date: string) => `${bookId}-${date}`;

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
          </tr>
        </thead>
        <tbody>
          {books.map((book) => {
            const isPrimary = book.primaryTrader === traderName;
            const isSecondary = book.secondaryTrader === traderName;
            const isDeskHead = book.deskHead === traderName;

            const getRoleLabel = () => {
              if (isPrimary) return 'Primary';
              if (isSecondary) return 'Secondary';
              if (isDeskHead) return 'Desk Head';
              return 'Assigned';
            };

            return (
              <tr
                key={book.id}
                className="border-b border-border transition-colors hover:bg-muted/30"
              >
                <td 
                  className="sticky left-0 z-10 bg-card px-4 py-3 cursor-pointer"
                  onClick={() => onBookClick(book)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground hover:text-primary transition-colors">
                      {book.name}
                    </span>
                    {book.comments.length > 0 && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {book.comments.length}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={isPrimary ? "default" : "secondary"} className="text-xs">
                    <User className="mr-1 h-3 w-3" />
                    {getRoleLabel()}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {book.desk}
                </td>
                {workingDays.map((day) => {
                  const signOff = book.signOffs.find((s) => s.date === day);
                  const status = signOff?.status || 'none';
                  const popoverKey = getPopoverKey(book.id, day);
                  const commentsForDate = book.comments.filter(c => c.date === day);

                  return (
                    <td key={day} className="px-4 py-3 text-center">
                      <Popover 
                        open={openPopover === popoverKey} 
                        onOpenChange={(open) => {
                          setOpenPopover(open ? popoverKey : null);
                          if (!open) setComment('');
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button 
                            className="relative inline-flex cursor-pointer transition-transform hover:scale-105"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 rounded-full border-2 border-dashed border-warning/50 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning hover:border-warning hover:bg-warning/20 transition-all">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75"></span>
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-warning"></span>
                                </span>
                                Pending
                              </span>
                            ) : status === 'signed' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-success/20 hover:ring-success/40 transition-all">
                                <Check className="h-3 w-3" />
                                Signed
                              </span>
                            ) : status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive ring-1 ring-destructive/20 hover:ring-destructive/40 transition-all">
                                <X className="h-3 w-3" />
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border hover:ring-muted-foreground/40 transition-all">
                                No Report
                              </span>
                            )}
                            {commentsForDate.length > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                {commentsForDate.length}
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0" align="center" onClick={(e) => e.stopPropagation()}>
                          <div className="p-3 border-b border-border">
                            <p className="font-medium text-foreground text-sm">{book.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">{formatWorkingDay(day)}</p>
                              {status !== 'pending' && status !== 'none' && (
                                <Badge variant={status === 'signed' ? 'default' : 'destructive'} className="text-xs">
                                  Currently: {status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-3 space-y-3">
                            <Textarea
                              placeholder="Add a comment (optional)..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="min-h-[60px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 gap-1"
                                variant={status === 'signed' ? 'secondary' : 'default'}
                                onClick={() => handleSignOff(book, day, 'sign')}
                              >
                                <Check className="h-4 w-4" />
                                {status === 'signed' ? 'Update' : 'Sign Off'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1 gap-1"
                                onClick={() => handleSignOff(book, day, 'reject')}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                            {commentsForDate.length > 0 && (
                              <div className="border-t border-border pt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Comments ({commentsForDate.length})
                                </p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {commentsForDate.map(c => (
                                    <div key={c.id} className="text-xs bg-muted/50 rounded p-2">
                                      <span className="font-medium">{c.authorName}</span>
                                      <p className="text-muted-foreground mt-0.5">{c.content}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
