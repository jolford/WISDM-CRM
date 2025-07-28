-- Delete all malformed imported reports and related data
DELETE FROM dashboard_widgets;
DELETE FROM report_charts;
DELETE FROM report_filters;
DELETE FROM scheduled_reports;
DELETE FROM reports;

-- Create a sample working report with proper configuration
INSERT INTO reports (
  id,
  name,
  description,
  user_id,
  data_sources,
  selected_fields,
  report_type,
  folder_name,
  created_by_name
) VALUES (
  gen_random_uuid(),
  'Deals Overview Report',
  'A comprehensive view of all deals showing key metrics and performance',
  (SELECT id FROM profiles WHERE email LIKE '%' LIMIT 1),
  ARRAY['deals'],
  '[
    {"field": "name", "label": "Deal Name", "type": "text"},
    {"field": "value", "label": "Deal Value", "type": "currency"},
    {"field": "stage", "label": "Stage", "type": "text"},
    {"field": "probability", "label": "Probability %", "type": "number"},
    {"field": "account_name", "label": "Account", "type": "text"},
    {"field": "contact_name", "label": "Contact", "type": "text"},
    {"field": "close_date", "label": "Close Date", "type": "date"},
    {"field": "created_at", "label": "Created", "type": "date"}
  ]'::jsonb,
  'custom',
  'Sales Reports',
  'System User'
);

-- Create a sample chart for the report
INSERT INTO report_charts (
  id,
  report_id,
  chart_type,
  chart_title,
  x_axis_field,
  y_axis_field,
  aggregate_function,
  position_x,
  position_y,
  width,
  height
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM reports WHERE name = 'Deals Overview Report' LIMIT 1),
  'bar',
  'Deals by Stage',
  'stage',
  'value',
  'sum',
  0,
  0,
  6,
  4
);