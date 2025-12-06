-- Create notification_logs table to track sent email reminders
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_email TEXT NOT NULL,
  trader_name TEXT NOT NULL,
  books_count INTEGER NOT NULL,
  book_names TEXT[] NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'reminder',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs(sent_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_email ON public.notifications(user_email);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notification logs are viewable by all (for admin purposes)
CREATE POLICY "Anyone can view notification logs"
ON public.notification_logs
FOR SELECT
USING (true);

-- Anyone can insert notification logs (edge function)
CREATE POLICY "Anyone can insert notification logs"
ON public.notification_logs
FOR INSERT
WITH CHECK (true);

-- Notifications are viewable by the recipient
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (true);

-- Anyone can insert notifications (edge function)
CREATE POLICY "Anyone can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Anyone can update notifications"
ON public.notifications
FOR UPDATE
USING (true);