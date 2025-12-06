import { useState } from 'react';
import { Book, BookComment, formatWorkingDay } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Reply, Send, Calendar, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookCommentsProps {
  book: Book;
  currentUserName: string;
  currentUserRole: 'trader' | 'product_controller' | 'desk_head';
  onUpdateBook: (book: Book) => void;
  availableDates?: string[];
}

export function BookComments({ 
  book, 
  currentUserName, 
  currentUserRole, 
  onUpdateBook,
  availableDates = []
}: BookCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [commentDate, setCommentDate] = useState(availableDates[0] || '');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim() || !commentDate) return;

    const comment: BookComment = {
      id: `comment-${Date.now()}`,
      bookId: book.id,
      date: commentDate,
      authorName: currentUserName,
      authorRole: currentUserRole,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedBook = {
      ...book,
      comments: [...book.comments, comment],
    };

    onUpdateBook(updatedBook);
    setNewComment('');
    toast({
      title: 'Comment Added',
      description: `Comment posted for ${formatWorkingDay(commentDate)}.`,
    });
  };

  const handleReply = (parentId: string, parentDate: string) => {
    if (!replyContent.trim()) return;

    const reply: BookComment = {
      id: `comment-${Date.now()}`,
      bookId: book.id,
      date: parentDate,
      authorName: currentUserName,
      authorRole: currentUserRole,
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      parentId,
    };

    const updatedBook = {
      ...book,
      comments: [...book.comments, reply],
    };

    onUpdateBook(updatedBook);
    setReplyContent('');
    setReplyingTo(null);
    toast({
      title: 'Reply Sent',
      description: 'Your reply has been posted.',
    });
  };

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
        hour: '2-digit',
        minute: '2-digit',
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

  // Get top-level comments (no parentId)
  const topLevelComments = book.comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => book.comments.filter(c => c.parentId === parentId);

  // Group comments by date for display
  const commentsByDate = topLevelComments.reduce((acc, comment) => {
    if (!acc[comment.date]) {
      acc[comment.date] = [];
    }
    acc[comment.date].push(comment);
    return acc;
  }, {} as Record<string, BookComment[]>);

  const sortedDates = Object.keys(commentsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-foreground">Discussion</h4>
          {book.comments.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {book.comments.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Add Comment - Available for all roles */}
      {availableDates.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", getRoleColor(currentUserRole))}>
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium text-foreground">{currentUserName}</span>
            <Badge variant={getRoleBadgeVariant(currentUserRole)} className="text-xs">
              {getRoleLabel(currentUserRole)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Report date:</span>
            <select
              value={commentDate}
              onChange={(e) => setCommentDate(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {formatWorkingDay(date)}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            placeholder="Type your message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[70px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !commentDate}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet</p>
          <p className="text-xs text-muted-foreground/70">Start the conversation</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px] pr-2">
          <div className="space-y-4">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-2">
                {/* Date Header */}
                <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-1 z-10">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-1.5 px-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatWorkingDay(date)}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Comments for this date */}
                <div className="space-y-3">
                  {commentsByDate[date].map((comment) => {
                    const replies = getReplies(comment.id);
                    const isOwnComment = comment.authorName === currentUserName;
                    
                    return (
                      <div key={comment.id} className="space-y-2">
                        {/* Main Comment */}
                        <div className={cn(
                          "rounded-lg p-3 space-y-2",
                          isOwnComment 
                            ? "bg-primary/10 border border-primary/20 ml-4" 
                            : "bg-card border border-border"
                        )}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", getRoleColor(comment.authorRole))}>
                                <User className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-medium text-foreground">
                                {comment.authorName}
                              </span>
                              <Badge variant={getRoleBadgeVariant(comment.authorRole)} className="text-[10px] px-1.5 py-0">
                                {getRoleLabel(comment.authorRole)}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground pl-8">{comment.content}</p>
                          {!isOwnComment && (
                            <div className="pl-8">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              >
                                <Reply className="h-3 w-3" />
                                Reply
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment.id && (
                          <div className="ml-8 space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-2">
                              <div className={cn("flex h-5 w-5 items-center justify-center rounded-full", getRoleColor(currentUserRole))}>
                                <User className="h-2.5 w-2.5" />
                              </div>
                              <span className="text-xs text-muted-foreground">Replying to {comment.authorName}</span>
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
                                onClick={() => handleReply(comment.id, comment.date)}
                                disabled={!replyContent.trim()}
                                size="sm"
                                className="gap-1"
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
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="ml-8 space-y-2 border-l-2 border-border pl-3">
                            {replies.map((reply) => {
                              const isOwnReply = reply.authorName === currentUserName;
                              return (
                                <div
                                  key={reply.id}
                                  className={cn(
                                    "rounded-lg p-2.5 space-y-1.5",
                                    isOwnReply 
                                      ? "bg-primary/10 border border-primary/20" 
                                      : "bg-muted/50"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <div className={cn("flex h-5 w-5 items-center justify-center rounded-full", getRoleColor(reply.authorRole))}>
                                        <User className="h-2.5 w-2.5" />
                                      </div>
                                      <span className="text-xs font-medium text-foreground">
                                        {reply.authorName}
                                      </span>
                                      <Badge variant={getRoleBadgeVariant(reply.authorRole)} className="text-[9px] px-1 py-0">
                                        {getRoleLabel(reply.authorRole)}
                                      </Badge>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDateTime(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground pl-6">{reply.content}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
