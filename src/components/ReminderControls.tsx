import { useState } from 'react';
import { Send, Clock, CheckCircle2, XCircle, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Book, getLastWorkingDays } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';

interface NotificationLog {
  id: string;
  trader_email: string;
  trader_name: string;
  books_count: number;
  book_names: string[];
  notification_type: string;
  status: string;
  error_message: string | null;
  sent_at: string;
}

interface ReminderControlsProps {
  books: Book[];
}

export function ReminderControls({ books }: ReminderControlsProps) {
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const { toast } = useToast();

  const today = getLastWorkingDays(1)[0];

  const getPendingBooks = () => {
    return books
      .filter((book) => !book.isRetired)
      .map((book) => {
        const pendingDates = book.signOffs
          .filter((s) => s.status === 'pending' || s.status === 'none')
          .map((s) => s.date);
        
        return {
          bookName: book.name,
          desk: book.desk,
          primaryTrader: book.primaryTrader,
          pendingDates,
        };
      })
      .filter((b) => b.pendingDates.length > 0);
  };

  const handleSendReminders = async () => {
    const pendingBooks = getPendingBooks();
    
    if (pendingBooks.length === 0) {
      toast({
        title: 'No pending reports',
        description: 'All reports have been signed off.',
      });
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-reminder-emails', {
        body: {
          pendingBooks,
          siteUrl: window.location.origin,
        },
      });

      if (error) throw error;

      toast({
        title: 'Reminders sent',
        description: `Notified ${data.tradersNotified} trader(s) about pending reports.`,
      });
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      toast({
        title: 'Failed to send reminders',
        description: error.message || 'An error occurred while sending reminders.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs((data || []) as NotificationLog[]);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const pendingBooks = getPendingBooks();
  const uniqueTraders = new Set(pendingBooks.map((b) => b.primaryTrader)).size;
  const totalPendingReports = pendingBooks.reduce(
    (sum, b) => sum + b.pendingDates.length,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4" />
              Email Reminders
            </CardTitle>
            <CardDescription className="mt-1">
              Send reminder emails to traders with pending sign-offs
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={fetchLogs}>
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Notification History</DialogTitle>
                <DialogDescription>
                  Recent email reminders sent to traders
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] mt-4">
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notifications sent yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {log.status === 'sent' ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {log.trader_name}
                            </span>
                            <Badge
                              variant={log.status === 'sent' ? 'default' : 'destructive'}
                              className="text-[10px]"
                            >
                              {log.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {log.trader_email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.books_count} book(s): {log.book_names.slice(0, 3).join(', ')}
                            {log.book_names.length > 3 && ` +${log.book_names.length - 3} more`}
                          </p>
                          {log.error_message && (
                            <p className="text-xs text-destructive mt-1">
                              Error: {log.error_message}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{totalPendingReports}</span> pending
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{uniqueTraders}</span> traders
              </span>
            </div>
          </div>
          <Button
            onClick={handleSendReminders}
            disabled={sending || pendingBooks.length === 0}
            size="sm"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Send Reminders
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
