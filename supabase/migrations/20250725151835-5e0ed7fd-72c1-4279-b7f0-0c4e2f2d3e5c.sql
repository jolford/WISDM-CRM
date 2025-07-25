-- Create maintenance tracking table
CREATE TABLE public.maintenance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('software', 'hardware')),
  purchase_date DATE,
  start_date DATE,
  end_date DATE,
  vendor_name TEXT,
  license_key TEXT,
  serial_number TEXT,
  cost NUMERIC(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  notes TEXT,
  renewal_reminder_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own maintenance records" 
ON public.maintenance_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own maintenance records" 
ON public.maintenance_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance records" 
ON public.maintenance_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance records" 
ON public.maintenance_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_maintenance_records_updated_at
BEFORE UPDATE ON public.maintenance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_maintenance_records_user_id ON public.maintenance_records(user_id);
CREATE INDEX idx_maintenance_records_end_date ON public.maintenance_records(end_date);
CREATE INDEX idx_maintenance_records_status ON public.maintenance_records(status);