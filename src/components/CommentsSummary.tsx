import { useState, useMemo } from 'react';
import { Book, BookComment, formatWorkingDay, currentUser } from '@/lib/mockData';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, User, Calendar, ChevronRight, Reply, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface CommentsSummaryProps {
  books: Book[];
  onBookClick: (book: Book, selectedDate?: string) => void;
  onUpdateBook?: (book: Book) => void;
}

export function CommentsSummary({ books, onBookClick, onUpdateBook }: CommentsSummaryProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Get all comments from all books, sorted by date
  const allComments = useMemo(() => {
    const comments: (BookComment & { bookName: string; book: Book; isUnread: boolean })[] = [];
    
    books.forEach(book => {
      book.comments.forEach(comment => {
        // For PC view, unread means: from trader/desk head AND not read by PC
        const isUnread = comment.authorRole !== 'product_controller' && !comment.readByPC;
        comments.push({
          ...comment,
          bookName: book.name,
          book,
          isUnread,
        });
      });
    });

    // Sort by createdAt descending (newest first), only get top-level comments
    return comments
      .filter(c => !c.parentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [books]);

  const unreadCount = useMemo(() => {
    return allComments.filter(c => c.isUnread).length;
  }, [allComments]);

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
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'product_controller':
        return 'bg-primary/10 text-primary';
      case 'trader':
        return 'bg-blue-500/10 text-blue-600';
      case 'desk_head':
        return 'bg-amber-500/10 text-amber-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleReply = (comment: BookComment & { bookName: string; book: Book }) => {
    if (!replyContent.trim() || !onUpdateBook) return;

    const reply: BookComment = {
      id: `comment-${Date.now()}`,
      bookId: comment.book.id,
      date: comment.date,
      authorName: currentUser.name,
      authorRole: 'product_controller',
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      parentId: comment.id,
    };

    const updatedBook = {
      ...comment.book,
      comments: [...comment.book.comments, reply],
    };

    onUpdateBook(updatedBook);
    setReplyContent('');
    setReplyingTo(null);
    toast({
      title: 'Reply Sent',
      description: `Reply posted on ${comment.bookName}.`,
    });
  };

  const getReplies = (commentId: string, book: Book) => {
    return book.comments.filter(c => c.parentId === commentId);
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
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {booksWithComments.length} books with comments
        </span>
      </div>
      
      <ScrollArea className="h-80">
        <div className="divide-y divide-border">
          {allComments.map((comment) => {
            const replies = getReplies(comment.id, comment.book);
            const isReplying = replyingTo === comment.id;
            
            return (
              <div 
                key={comment.id} 
                className={cn(
                  "p-3 hover:bg-muted/10 transition-colors",
                  comment.isUnread && "bg-destructive/5 border-l-2 border-destructive"
                )}
              >
                <div 
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => onBookClick(comment.book, comment.date)}
                >
                  <div className="relative">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", getRoleColor(comment.authorRole))}>
                      <User className="h-4 w-4" />
                    </div>
                    {comment.isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                    )}
                  </div>
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", getRoleColor(comment.authorRole))}>
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
                    <p className="text-sm text-foreground mt-1">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
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

                {/* Replies preview */}
                {replies.length > 0 && (
                  <div className="ml-11 mt-2 space-y-2 border-l-2 border-border pl-3">
                    {replies.slice(0, 2).map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", getRoleColor(reply.authorRole))}>
                          <User className="h-2.5 w-2.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground">
                              {reply.authorName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDateTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {replies.length > 2 && (
                      <button 
                        className="text-xs text-primary hover:underline ml-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookClick(comment.book, comment.date);
                        }}
                      >
                        +{replies.length - 2} more replies
                      </button>
                    )}
                  </div>
                )}

                {/* Reply action */}
                {onUpdateBook && !isReplying && (
                  <div className="ml-11 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyingTo(comment.id);
                      }}
                    >
                      <Reply className="h-3 w-3" />
                      Reply
                    </Button>
                  </div>
                )}

                {/* Inline reply form */}
                {isReplying && (
                  <div 
                    className="ml-11 mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("flex h-5 w-5 items-center justify-center rounded-full", getRoleColor('product_controller'))}>
                        <User className="h-2.5 w-2.5" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Replying to {comment.authorName}
                      </span>
                    </div>
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px] text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReply(comment)}
                        disabled={!replyContent.trim()}
                        size="sm"
                        className="gap-1.5"
                      >
                        <Send className="h-3 w-3" />
                        Send
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      {allComments.length > 15 && (
        <div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
          <span className="text-xs text-muted-foreground">
            Scroll to see more comments
          </span>
        </div>
      )}
    </div>
  );
}
