import { useState, useEffect } from 'react';
import { Book, formatWorkingDay, mockUsers, SignOffStatus, getLastWorkingDays, BookComment } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, MessageSquare, Archive, UserCog, Clock, User, Send, Reply, Calendar, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { currentUser } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface BookDetailPanelProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onUpdateBook: (book: Book) => void;
  selectedDate?: string | null;
}

export function BookDetailPanel({ book, open, onClose, onUpdateBook, selectedDate }: BookDetailPanelProps) {
  const [comment, setComment] = useState('');
  const [selectedController, setSelectedController] = useState('');
  const [activeTab, setActiveTab] = useState('signoff');
  const [dateFilteredView, setDateFilteredView] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const workingDays = getLastWorkingDays(5);

  // When selectedDate is provided, switch to comments tab with that date filtered
  useEffect(() => {
    if (selectedDate && book) {
      setActiveTab('comments');
      setDateFilteredView(selectedDate);
    }
  }, [selectedDate, book]);

  // Reset state when panel closes
  useEffect(() => {
    if (!open) {
      setActiveTab('signoff');
      setDateFilteredView(null);
      setReplyingTo(null);
      setReplyContent('');
      setNewComment('');
    }
  }, [open]);

  if (!book) return null;

  const handleSignOff = (status: SignOffStatus) => {
    const updatedSignOffs = [...book.signOffs];
    const todayIndex = updatedSignOffs.findIndex(s => s.status === 'pending');
    if (todayIndex !== -1) {
      updatedSignOffs[todayIndex] = {
        ...updatedSignOffs[todayIndex],
        status,
        signedBy: status === 'signed' ? 'Current User' : undefined,
        signedAt: status === 'signed' ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined,
        comment: comment || undefined,
      };
      onUpdateBook({ ...book, signOffs: updatedSignOffs });
      toast.success(`Report ${status === 'signed' ? 'signed off' : 'rejected'} successfully`);
      setComment('');
    }
  };

  const handleRetire = () => {
    onUpdateBook({ ...book, isRetired: !book.isRetired });
    toast.success(`Book ${book.isRetired ? 'restored' : 'retired'} successfully`);
  };

  const handleChangeOwnership = () => {
    if (selectedController) {
      const controller = mockUsers.find(u => u.id === selectedController);
      if (controller) {
        onUpdateBook({ ...book, productController: controller.name });
        toast.success(`Ownership transferred to ${controller.name}`);
        setSelectedController('');
      }
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !dateFilteredView) return;

    const commentObj: BookComment = {
      id: `comment-${Date.now()}`,
      bookId: book.id,
      date: dateFilteredView,
      authorName: currentUser.name,
      authorRole: 'product_controller',
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    onUpdateBook({
      ...book,
      comments: [...book.comments, commentObj],
    });
    setNewComment('');
    toast.success(`Comment added for ${formatWorkingDay(dateFilteredView)}`);
  };

  const handleReply = (parentId: string, parentDate: string) => {
    if (!replyContent.trim()) return;

    const reply: BookComment = {
      id: `comment-${Date.now()}`,
      bookId: book.id,
      date: parentDate,
      authorName: currentUser.name,
      authorRole: 'product_controller',
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      parentId,
    };

    onUpdateBook({
      ...book,
      comments: [...book.comments, reply],
    });
    setReplyContent('');
    setReplyingTo(null);
    toast.success('Reply sent');
  };

  const productControllers = mockUsers.filter(u => u.role === 'product_controller');

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

  // Get comments filtered by date if dateFilteredView is set
  const filteredComments = dateFilteredView
    ? book.comments.filter(c => c.date === dateFilteredView && !c.parentId)
    : book.comments.filter(c => !c.parentId);

  const getReplies = (parentId: string) => book.comments.filter(c => c.parentId === parentId);

  const commentsForSelectedDate = dateFilteredView 
    ? book.comments.filter(c => c.date === dateFilteredView).length 
    : book.comments.length;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[480px] border-l border-border bg-card sm:max-w-[480px]">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-3 text-xl">
            <span className="text-foreground">{book.name}</span>
            {book.isRetired && (
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                RETIRED
              </span>
            )}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{book.desk}</p>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="signoff">Sign Off</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments" className="relative">
              Comments
              {book.comments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-4 p-0 text-[10px]">
                  {book.comments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="signoff" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Last 5 Working Days</h4>
              <div className="space-y-2">
                {book.signOffs.map((signOff) => {
                  const commentsForDate = book.comments.filter(c => c.date === signOff.date);
                  
                  return (
                    <div
                      key={signOff.date}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => {
                        setActiveTab('comments');
                        setDateFilteredView(signOff.date);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <StatusBadge status={signOff.status} />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {formatWorkingDay(signOff.date)}
                          </p>
                          {signOff.signedBy && (
                            <p className="text-xs text-muted-foreground">
                              by {signOff.signedBy} at {signOff.signedAt}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {commentsForDate.length > 0 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {commentsForDate.length}
                          </Badge>
                        )}
                        {signOff.comment && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[100px]">
                            <span className="truncate">{signOff.comment}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {book.signOffs.some(s => s.status === 'pending') && !book.isRetired && (
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground">Take Action</h4>
                <Textarea
                  placeholder="Add a comment (optional)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none bg-muted/30"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSignOff('signed')}
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accept & Sign
                  </Button>
                  <Button
                    onClick={() => handleSignOff('rejected')}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Primary Trader</p>
                  <p className="text-sm font-medium text-foreground">{book.primaryTrader}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Secondary Trader</p>
                  <p className="text-sm font-medium text-foreground">{book.secondaryTrader}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20 text-warning">
                  <UserCog className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Desk Head</p>
                  <p className="text-sm font-medium text-foreground">{book.deskHead}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-success">
                  <UserCog className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Product Controller</p>
                  <p className="text-sm font-medium text-foreground">{book.productController}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Reminder Schedule</h4>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">09:30</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">17:00</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              {/* Date filter header */}
              {dateFilteredView ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {formatWorkingDay(dateFilteredView)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {commentsForSelectedDate} comments
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setDateFilteredView(null)}
                  >
                    <ChevronLeft className="h-3 w-3" />
                    All dates
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground">All Comments</h4>
                    <Badge variant="secondary" className="text-xs">
                      {book.comments.length}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Click a date to filter
                  </span>
                </div>
              )}

              {/* Quick date selector */}
              {!dateFilteredView && (
                <div className="flex flex-wrap gap-2">
                  {workingDays.map(day => {
                    const count = book.comments.filter(c => c.date === day).length;
                    return (
                      <Button
                        key={day}
                        variant={count > 0 ? "secondary" : "outline"}
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => setDateFilteredView(day)}
                      >
                        {formatWorkingDay(day)}
                        {count > 0 && (
                          <span className="bg-primary/20 text-primary px-1.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Add comment for filtered date */}
              {dateFilteredView && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", getRoleColor('product_controller'))}>
                      <User className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
                    <Badge variant="default" className="text-[10px]">PC</Badge>
                  </div>
                  <Textarea
                    placeholder={`Add a comment for ${formatWorkingDay(dateFilteredView)}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="h-3 w-3" />
                      Send
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments list */}
              {filteredComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {dateFilteredView 
                      ? `No comments for ${formatWorkingDay(dateFilteredView)}`
                      : 'No comments yet'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground/70">Start the conversation</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[350px] pr-2">
                  <div className="space-y-3">
                    {filteredComments
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((commentItem) => {
                        const replies = getReplies(commentItem.id);
                        const isOwnComment = commentItem.authorName === currentUser.name;
                        
                        return (
                          <div key={commentItem.id} className="space-y-2">
                            <div className={cn(
                              "rounded-lg p-3 space-y-2",
                              isOwnComment 
                                ? "bg-primary/10 border border-primary/20 ml-4" 
                                : "bg-card border border-border"
                            )}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", getRoleColor(commentItem.authorRole))}>
                                    <User className="h-3 w-3" />
                                  </div>
                                  <span className="text-sm font-medium text-foreground">
                                    {commentItem.authorName}
                                  </span>
                                  <Badge variant={getRoleBadgeVariant(commentItem.authorRole)} className="text-[10px] px-1.5 py-0">
                                    {getRoleLabel(commentItem.authorRole)}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  {formatDateTime(commentItem.createdAt)}
                                </span>
                              </div>
                              {!dateFilteredView && (
                                <Badge variant="outline" className="text-[10px] gap-1 ml-8">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {formatWorkingDay(commentItem.date)}
                                </Badge>
                              )}
                              <p className="text-sm text-foreground pl-8">{commentItem.content}</p>
                              {!isOwnComment && (
                                <div className="pl-8">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                    onClick={() => setReplyingTo(replyingTo === commentItem.id ? null : commentItem.id)}
                                  >
                                    <Reply className="h-3 w-3" />
                                    Reply
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Reply input */}
                            {replyingTo === commentItem.id && (
                              <div className="ml-8 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-2">
                                  <div className={cn("flex h-5 w-5 items-center justify-center rounded-full", getRoleColor('product_controller'))}>
                                    <User className="h-2.5 w-2.5" />
                                  </div>
                                  <span className="text-xs text-muted-foreground">Replying to {commentItem.authorName}</span>
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
                                    onClick={() => handleReply(commentItem.id, commentItem.date)}
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
                                  const isOwnReply = reply.authorName === currentUser.name;
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
                </ScrollArea>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Transfer Ownership</h4>
              <div className="flex gap-2">
                <Select value={selectedController} onValueChange={setSelectedController}>
                  <SelectTrigger className="flex-1 bg-muted/30">
                    <SelectValue placeholder="Select controller" />
                  </SelectTrigger>
                  <SelectContent>
                    {productControllers.map((controller) => (
                      <SelectItem key={controller.id} value={controller.id}>
                        {controller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleChangeOwnership}
                  disabled={!selectedController}
                  variant="secondary"
                >
                  Transfer
                </Button>
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Book Status</h4>
              <Button
                onClick={handleRetire}
                variant={book.isRetired ? 'default' : 'outline'}
                className="w-full"
              >
                <Archive className="mr-2 h-4 w-4" />
                {book.isRetired ? 'Restore Book' : 'Retire Book'}
              </Button>
              <p className="text-xs text-muted-foreground">
                {book.isRetired
                  ? 'This book is currently retired and not included in daily checks.'
                  : 'Retiring a book removes it from the daily sign-off checklist.'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
