-- Create the pots table (The Habit Engine State)
CREATE TABLE pots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_coins INTEGER NOT NULL,
  creation_date TIMESTAMPTZ DEFAULT now(),
  m_target FLOAT NOT NULL,
  current_score FLOAT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active'
);

-- Create the logs table (The Daily Investment Ledger)
CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pot_id UUID REFERENCES pots(id) ON DELETE CASCADE,
  coins_invested INTEGER NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE
);
