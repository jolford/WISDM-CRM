-- Add customer/company relationship to maintenance records
ALTER TABLE maintenance_records 
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Add an index for better performance
CREATE INDEX idx_maintenance_records_company_id ON maintenance_records(company_id);

-- Add a comment to explain the new column
COMMENT ON COLUMN maintenance_records.company_id IS 'Links maintenance record to the customer/company that owns the product';