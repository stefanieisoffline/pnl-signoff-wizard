import { useState } from 'react';
import { Book, getLastWorkingDays, formatWorkingDay } from '@/lib/mockData';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/badge';
import { BookComments } from './BookComments';
import { 
  CheckCircle, 
  XCircle, 
  Building2, 
  Users,
  Calendar,
  MessageSquare,
  User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TraderBookDetailPanelProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onUpdateBook: (book: Book) => void;
  traderName: string;
}

export function TraderBookDetailPanel({ book, open, onClose, onUpdateBook, traderName }: TraderBookDetailPanelProps) {
  const [comment, setComment] = useState('');
  const workingDays = getLastWorkingDays(5);

  if (!book) return null;

  const isPrimary = book.primaryTrader === traderName;
  const isSecondary = book.secondaryTrader === traderName;
  const isDeskHead = book.deskHead === traderName;
  const todaySignOff = book.signOffs.find(s => s.date === workingDays[0]);
  const canTakeAction = todaySignOff?.status === 'pending';

  // Determine role for comments
  const getTraderRole = (): 'trader' | 'desk_head' => {
    if (isDeskHead) return 'desk_head';
    return 'trader';
  };

  const handleSignOff = (action: 'accept' | 'reject') => {
    const updatedSignOffs = book.signOffs.map(s =>
      s.date === workingDays[0]
        ? {
            ...s,
            status: action === 'accept' ? 'signed' as const : 'rejected' as const,
            signedBy: traderName,
            signedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            comment: comment || undefined,
          }
        : s
    );

    const updatedBook = { ...book, signOffs: updatedSignOffs };
    onUpdateBook(updatedBook);
    setComment('');

    toast({
      title: action === 'accept' ? 'Report Signed' : 'Report Rejected',
      description: `${book.name} has been ${action === 'accept' ? 'signed off' : 'rejected'}.`,
      variant: action === 'accept' ? 'default' : 'destructive',
    });
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-xl">{book.name}</SheetTitle>
            <Badge variant={isPrimary ? "default" : "secondary"} className="text-xs">
              <User className="mr-1 h-3 w-3" />
              {isPrimary ? 'Primary' : isSecondary ? 'Secondary' : 'Desk Head'}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="signoff" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signoff">Sign Off</TabsTrigger>
            <TabsTrigger value="comments" className="gap-1">
              Comments
              {book.comments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {book.comments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signoff" className="mt-4 space-y-6">
            {/* Book Info */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Desk:</span>
                <span className="font-medium text-foreground">{book.desk}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Product Controller:</span>
                <span className="font-medium text-foreground">{book.productController}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Desk Head:</span>
                <span className="font-medium text-foreground">{book.deskHead}</span>
              </div>
              {!isPrimary && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Primary Trader:</span>
                  <span className="font-medium text-foreground">{book.primaryTrader}</span>
                </div>
              )}
            </div>

            {/* Sign-Off Action */}
            {canTakeAction && (
              <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Sign Off for Today</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-sm text-muted-foreground">
                    Comment (optional)
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSignOff('accept')}
                    className="flex-1 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept & Sign
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleSignOff('reject')}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Status when not pending */}
            {!canTakeAction && todaySignOff && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Status</span>
                  <StatusBadge status={todaySignOff.status} />
                </div>
                {todaySignOff.signedBy && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {todaySignOff.status === 'signed' ? 'Signed' : 'Action'} by {todaySignOff.signedBy} at {todaySignOff.signedAt}
                  </p>
                )}
                {todaySignOff.comment && (
                  <div className="mt-2 flex items-start gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{todaySignOff.comment}</span>
                  </div>
                )}
              </div>
            )}

            {/* Sign-Off History */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Sign-Off History (Last 5 Days)</h4>
              <div className="space-y-2">
                {workingDays.map((day) => {
                  const signOff = book.signOffs.find(s => s.date === day);
                  const isToday = day === workingDays[0];
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        isToday ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {formatWorkingDay(day)}
                        </span>
                        {isToday && (
                          <Badge variant="outline" className="text-xs">Today</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={signOff?.status || 'none'} />
                        {signOff?.signedBy && (
                          <span className="text-xs text-muted-foreground">
                            {signOff.signedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <BookComments
              book={book}
              currentUserName={traderName}
              currentUserRole={getTraderRole()}
              onUpdateBook={onUpdateBook}
              canAddComment={true}
              canReply={false}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
