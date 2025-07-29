-- CRITICAL SECURITY FIXES - Part 1

-- 1. Enable RLS on all unprotected tables
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for rules tables
CREATE POLICY "Admins can manage all rules" ON public.rules
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage automation rules" ON public.automation_rules
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage automation conditions" ON public.automation_conditions
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage automation actions" ON public.automation_actions
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view automation logs" ON public.automation_logs
FOR SELECT USING (true);

CREATE POLICY "System can insert automation logs" ON public.automation_logs
FOR INSERT WITH CHECK (true);