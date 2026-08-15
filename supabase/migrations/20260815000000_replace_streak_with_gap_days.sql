-- A streak can be derived from logs when needed. Persist the simpler, current
-- number of days since a pot's latest investment for dashboard warnings.
ALTER TABLE public.pots
DROP COLUMN IF EXISTS current_streak;

ALTER TABLE public.pots
ADD COLUMN IF NOT EXISTS current_gap_days INTEGER NOT NULL DEFAULT 0
CHECK (current_gap_days >= 0);
