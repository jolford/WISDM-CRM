-- Enhanced reports system for advanced report builder

-- Drop existing reports table constraints if any
DROP TABLE IF EXISTS public.report_fields CASCADE;
DROP TABLE IF EXISTS public.report_filters CASCADE;
DROP TABLE IF EXISTS public.report_charts CASCADE;
DROP TABLE IF EXISTS public.scheduled_reports CASCADE;

-- Enhanced reports table
ALTER TABLE public.reports 
DROP COLUMN IF EXISTS report_type,
DROP COLUMN IF EXISTS data_source,
DROP COLUMN IF EXISTS schedule,
DROP COLUMN IF EXISTS format,
DROP COLUMN IF EXISTS recipients,
DROP COLUMN IF EXISTS parameters;

ALTER TABLE public.reports 
ADD COLUMN report_type text NOT NULL DEFAULT 'custom',
ADD COLUMN data_sources text[] DEFAULT ARRAY['deals'],
ADD COLUMN selected_fields jsonb DEFAULT '[]'::jsonb,
ADD COLUMN group_by_fields text[] DEFAULT '{}',
ADD COLUMN aggregate_functions jsonb DEFAULT '{}'::jsonb,
ADD COLUMN sort_fields jsonb DEFAULT '[]'::jsonb,
ADD COLUMN chart_config jsonb DEFAULT '{}'::jsonb,
ADD COLUMN is_dashboard boolean DEFAULT false,
ADD COLUMN dashboard_layout jsonb DEFAULT '{}'::jsonb,
ADD COLUMN shared_with text[] DEFAULT '{}',
ADD COLUMN is_public boolean DEFAULT false;

-- Report filters table for advanced filtering
CREATE TABLE public.report_filters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  operator text NOT NULL, -- equals, not_equals, contains, starts_with, ends_with, greater_than, less_than, between, in, not_in
  value jsonb NOT NULL,
  logical_operator text DEFAULT 'AND', -- AND, OR
  filter_group integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Report charts table for multiple charts per report
CREATE TABLE public.report_charts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  chart_type text NOT NULL, -- bar, line, pie, area, column, scatter, funnel
  chart_title text,
  x_axis_field text,
  y_axis_field text,
  aggregate_function text DEFAULT 'sum', -- sum, count, avg, min, max
  chart_config jsonb DEFAULT '{}'::jsonb,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 12,
  height integer DEFAULT 6,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Scheduled reports table
CREATE TABLE public.scheduled_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  schedule_type text NOT NULL, -- daily, weekly, monthly, quarterly
  schedule_config jsonb NOT NULL, -- {day_of_week: 1, time: "09:00", timezone: "UTC"}
  recipients text[] NOT NULL,
  format text NOT NULL DEFAULT 'pdf', -- pdf, excel, csv
  is_active boolean DEFAULT true,
  last_sent timestamp with time zone,
  next_send timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Dashboard widgets table for custom dashboards
CREATE TABLE public.dashboard_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  widget_type text NOT NULL, -- chart, metric, table, text
  widget_title text,
  data_source text NOT NULL,
  widget_config jsonb NOT NULL,
  position_x integer NOT NULL DEFAULT 0,
  position_y integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 4,
  height integer NOT NULL DEFAULT 4,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.report_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- RLS policies for report_filters
CREATE POLICY "Users can manage filters for their own reports" 
ON public.report_filters 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE reports.id = report_filters.report_id 
    AND reports.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE reports.id = report_filters.report_id 
    AND reports.user_id = auth.uid()
  )
);

-- RLS policies for report_charts
CREATE POLICY "Users can manage charts for their own reports" 
ON public.report_charts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE reports.id = report_charts.report_id 
    AND reports.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE reports.id = report_charts.report_id 
    AND reports.user_id = auth.uid()
  )
);

-- RLS policies for scheduled_reports
CREATE POLICY "Users can manage their own scheduled reports" 
ON public.scheduled_reports 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for dashboard_widgets
CREATE POLICY "Users can manage widgets for their own dashboards" 
ON public.dashboard_widgets 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE reports.id = dashboard_widgets.dashboard_id 
    AND reports.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE reports.id = dashboard_widgets.dashboard_id 
    AND reports.user_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_report_filters_updated_at
  BEFORE UPDATE ON public.report_filters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_charts_updated_at
  BEFORE UPDATE ON public.report_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_report_filters_report_id ON public.report_filters(report_id);
CREATE INDEX idx_report_charts_report_id ON public.report_charts(report_id);
CREATE INDEX idx_scheduled_reports_user_id ON public.scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_next_send ON public.scheduled_reports(next_send) WHERE is_active = true;
CREATE INDEX idx_dashboard_widgets_dashboard_id ON public.dashboard_widgets(dashboard_id);