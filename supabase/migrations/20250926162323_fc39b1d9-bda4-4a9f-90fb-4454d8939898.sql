-- Create table for maintenance notifications
CREATE TABLE public.maintenance_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_record_id UUID REFERENCES public.maintenance_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('90_day', '60_day', '30_day')),
  email_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(maintenance_record_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.maintenance_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.maintenance_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
ON public.maintenance_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.maintenance_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_maintenance_notifications_updated_at
BEFORE UPDATE ON public.maintenance_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add notification settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN notification_email TEXT,
ADD COLUMN enable_maintenance_notifications BOOLEAN DEFAULT true;