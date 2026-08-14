-- 1. Add user_id to pots and link it to Supabase's built-in auth.users table
ALTER TABLE pots 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;

-- 2. Create an index on user_id (Critical for RLS performance)
CREATE INDEX idx_pots_user_id ON pots(user_id);

-- 3. Enable Row Level Security (RLS) on both tables
ALTER TABLE pots ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- 4. Create policies so users can only view and manage their OWN pots
CREATE POLICY "Users can manage their own pots" 
ON pots FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- 5. Create policies so users can only view and manage logs for THEIR pots
CREATE POLICY "Users can manage their own logs" 
ON logs FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM pots 
    WHERE pots.id = logs.pot_id AND pots.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pots 
    WHERE pots.id = logs.pot_id AND pots.user_id = auth.uid()
  )
);
