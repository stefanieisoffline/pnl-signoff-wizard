import { useState } from 'react';
import { Book, formatWorkingDay, mockUsers, SignOffStatus } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookComments } from './BookComments';
import { Check, X, MessageSquare, Archive, UserCog, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { currentUser } from '@/lib/mockData';

interface BookDetailPanelProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onUpdateBook: (book: Book) => void;
}

export function BookDetailPanel({ book, open, onClose, onUpdateBook }: BookDetailPanelProps) {
  const [comment, setComment] = useState('');
  const [selectedController, setSelectedController] = useState('');

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

  const productControllers = mockUsers.filter(u => u.role === 'product_controller');

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

        <Tabs defaultValue="signoff" className="mt-6">
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
                {book.signOffs.map((signOff) => (
                  <div
                    key={signOff.date}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3"
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
                    {signOff.comment && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span className="max-w-[120px] truncate">{signOff.comment}</span>
                      </div>
                    )}
                  </div>
                ))}
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
            <BookComments
              book={book}
              currentUserName={currentUser.name}
              currentUserRole="product_controller"
              onUpdateBook={onUpdateBook}
              canAddComment={false}
              canReply={true}
            />
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
