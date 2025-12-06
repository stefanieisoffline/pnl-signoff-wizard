import { useState } from 'react';
import { Book, BookComment, formatWorkingDay } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Reply, Send, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BookCommentsProps {
  book: Book;
  currentUserName: string;
  currentUserRole: 'trader' | 'product_controller' | 'desk_head';
  onUpdateBook: (book: Book) => void;
  canAddComment: boolean;
  canReply: boolean;
  selectedDate?: string; // If provided, only show comments for this date
  availableDates?: string[]; // Dates trader can comment on
}

export function BookComments({ 
  book, 
  currentUserName, 
  currentUserRole, 
  onUpdateBook,
  canAddComment,
  canReply,
  selectedDate,
  availableDates = []
}: BookCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [commentDate, setCommentDate] = useState(selectedDate || availableDates[0] || '');
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
      title: 'Reply Added',
      description: 'Your reply has been posted.',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // Filter comments by selected date if provided
  const filteredComments = selectedDate 
    ? book.comments.filter(c => c.date === selectedDate)
    : book.comments;

  // Get top-level comments (no parentId)
  const topLevelComments = filteredComments.filter(c => !c.parentId);
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
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium text-foreground">
          Comments ({filteredComments.length})
        </h4>
      </div>

      {/* Add Comment */}
      {canAddComment && availableDates.length > 0 && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Comment on report:</span>
            <select
              value={commentDate}
              onChange={(e) => setCommentDate(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {formatWorkingDay(date)}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            placeholder="Add a comment about this report..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || !commentDate}
            size="sm"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Post Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      {sortedDates.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No comments yet.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-2">
              {/* Date Header */}
              {!selectedDate && (
                <div className="flex items-center gap-2 py-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {formatWorkingDay(date)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {commentsByDate[date].length} {commentsByDate[date].length === 1 ? 'comment' : 'comments'}
                  </Badge>
                </div>
              )}

              {/* Comments for this date */}
              <div className="space-y-2">
                {commentsByDate[date].map((comment) => {
                  const replies = getReplies(comment.id);
                  return (
                    <div key={comment.id} className="space-y-2">
                      {/* Main Comment */}
                      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {comment.authorName}
                            </span>
                            <Badge variant={getRoleBadgeVariant(comment.authorRole)} className="text-xs">
                              {getRoleLabel(comment.authorRole)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                        {canReply && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            <Reply className="h-3 w-3" />
                            Reply
                          </Button>
                        )}
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="ml-4 space-y-2">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px]"
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
                        <div className="ml-4 space-y-2">
                          {replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {reply.authorName}
                                  </span>
                                  <Badge variant={getRoleBadgeVariant(reply.authorRole)} className="text-xs">
                                    {getRoleLabel(reply.authorRole)}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
