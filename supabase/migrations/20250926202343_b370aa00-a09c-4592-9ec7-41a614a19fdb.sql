-- Create egnyte_connections table for storing Egnyte site connections
CREATE TABLE public.egnyte_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain_name TEXT NOT NULL, -- e.g., "yourcompany.egnyte.com"
  api_token TEXT, -- Encrypted API token (if using API)
  username TEXT, -- For basic auth
  connection_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT egnyte_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.egnyte_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for egnyte_connections
CREATE POLICY "Users can view their own egnyte connections" 
  ON public.egnyte_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own egnyte connections" 
  ON public.egnyte_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own egnyte connections" 
  ON public.egnyte_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own egnyte connections" 
  ON public.egnyte_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_egnyte_connections_updated_at
  BEFORE UPDATE ON public.egnyte_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();