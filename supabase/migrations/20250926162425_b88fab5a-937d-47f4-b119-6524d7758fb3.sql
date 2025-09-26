-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule maintenance notification checks to run daily at 9 AM
SELECT cron.schedule(
  'maintenance-notifications-daily',
  '0 9 * * *', -- 9 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://vdrppzblasrdytafgpvp.supabase.co/functions/v1/maintenance-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcnBwemJsYXNyZHl0YWZncHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzOTQyNDUsImV4cCI6MjA2ODk3MDI0NX0.fgWtQs8ZEQ9aADi_K_np2LTqAwumtdFnnSy0C1y_i5c"}'::jsonb,
        body:='{"source": "cron_job"}'::jsonb
    ) as request_id;
  $$
);