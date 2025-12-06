import { useMemo } from 'react';
import { Book, BookComment, formatWorkingDay } from '@/lib/mockData';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, User, Calendar, ChevronRight } from 'lucide-react';

interface CommentsSummaryProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

export function CommentsSummary({ books, onBookClick }: CommentsSummaryProps) {
  // Get all comments from all books, sorted by date
  const allComments = useMemo(() => {
    const comments: (BookComment & { bookName: string; book: Book })[] = [];
    
    books.forEach(book => {
      book.comments.forEach(comment => {
        comments.push({
          ...comment,
          bookName: book.name,
          book,
        });
      });
    });

    // Sort by createdAt descending (newest first)
    return comments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [books]);

  // Get unique books with comments
  const booksWithComments = useMemo(() => {
    const bookMap = new Map<string, { book: Book; count: number; latestComment: string }>();
    
    allComments.forEach(comment => {
      const existing = bookMap.get(comment.bookId);
      if (!existing) {
        bookMap.set(comment.bookId, {
          book: comment.book,
          count: 1,
          latestComment: comment.createdAt,
        });
      } else {
        existing.count++;
      }
    });

    return Array.from(bookMap.values()).sort((a, b) => 
      new Date(b.latestComment).getTime() - new Date(a.latestComment).getTime()
    );
  }, [allComments]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'product_controller':
        return 'default';
      case 'trader':
        return 'secondary';
      case 'desk_head':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'product_controller':
        return 'PC';
      case 'trader':
        return 'Trader';
      case 'desk_head':
        return 'Desk Head';
      default:
        return role;
    }
  };

  if (allComments.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Comments</h3>
          <Badge variant="secondary" className="text-xs">
            {allComments.length} total
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {booksWithComments.length} books with comments
        </span>
      </div>
      
      <ScrollArea className="max-h-64">
        <div className="divide-y divide-border">
          {allComments.slice(0, 10).map((comment) => (
            <div 
              key={comment.id}
              className="flex items-start gap-3 p-3 hover:bg-muted/20 cursor-pointer transition-colors"
              onClick={() => onBookClick(comment.book)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {comment.authorName}
                  </span>
                  <Badge variant={getRoleBadgeVariant(comment.authorRole)} className="text-[10px] px-1.5 py-0">
                    {getRoleLabel(comment.authorRole)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {comment.content}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatWorkingDay(comment.date)}
                  </Badge>
                  <span className="text-xs text-primary font-medium flex items-center gap-0.5">
                    {comment.bookName}
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {allComments.length > 10 && (
        <div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
          <span className="text-xs text-muted-foreground">
            Showing 10 of {allComments.length} comments
          </span>
        </div>
      )}
    </div>
  );
}
