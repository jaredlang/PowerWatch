-- Drop the existing constraint and recreate it to ensure it's correct
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- Add the constraint with the correct values
ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status IN ('pending', 'under-repair', 'repaired'));

-- Update any existing rows that might have invalid status values
UPDATE reports SET status = 'pending' WHERE status NOT IN ('pending', 'under-repair', 'repaired');
