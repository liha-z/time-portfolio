-- Persist the inputs of each daily score so several sessions can revise the
-- same day's reward without granting the reward more than once.
ALTER TABLE public.pots
ADD COLUMN IF NOT EXISTS difficulty INTEGER NOT NULL DEFAULT 5
CHECK (difficulty BETWEEN 1 AND 10);

ALTER TABLE public.logs
ADD COLUMN IF NOT EXISTS invested_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.pot_daily_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id UUID NOT NULL REFERENCES public.pots(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  base_score DOUBLE PRECISION NOT NULL,
  daily_minutes INTEGER NOT NULL CHECK (daily_minutes >= 0),
  daily_reward DOUBLE PRECISION NOT NULL CHECK (daily_reward >= 0),
  effective_gap DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (effective_gap >= 0),
  streak_days DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pot_id, score_date)
);

CREATE INDEX IF NOT EXISTS idx_pot_daily_scores_pot_date
ON public.pot_daily_scores (pot_id, score_date DESC);

ALTER TABLE public.pot_daily_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily pot scores"
ON public.pot_daily_scores
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pots
    WHERE pots.id = pot_daily_scores.pot_id
      AND pots.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pots
    WHERE pots.id = pot_daily_scores.pot_id
      AND pots.user_id = auth.uid()
  )
);
