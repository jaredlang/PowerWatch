ALTER TABLE reports ADD COLUMN user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view all reports"
ON reports FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON reports FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON reports FOR DELETE
USING (auth.uid() = user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
