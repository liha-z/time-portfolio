-- Log a session and update all derived score state in one transaction.
CREATE OR REPLACE FUNCTION public.log_time_investment(
  p_pot_id UUID,
  p_minutes INTEGER,
  p_logged_at TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  log_id UUID,
  score_date DATE,
  daily_minutes INTEGER,
  current_score DOUBLE PRECISION,
  daily_reward DOUBLE PRECISION,
  effective_gap DOUBLE PRECISION,
  streak_days DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_logged_at TIMESTAMPTZ := COALESCE(p_logged_at, now());
  v_score_date DATE;
  v_log_id UUID;
  v_creation_date TIMESTAMPTZ;
  v_previous_score DOUBLE PRECISION;
  v_target_minutes INTEGER;
  v_difficulty INTEGER;
  v_base_score DOUBLE PRECISION;
  v_daily_minutes INTEGER;
  v_previous_investment_at TIMESTAMPTZ;
  v_current_window INTEGER;
  v_previous_window INTEGER;
  v_effective_gap DOUBLE PRECISION := 0;
  v_streak_gap DOUBLE PRECISION := 0;
  v_streak_days DOUBLE PRECISION := 0;
  v_last_streak_investment_at TIMESTAMPTZ;
  v_curve_steepness DOUBLE PRECISION;
  v_daily_reward DOUBLE PRECISION;
  v_current_score DOUBLE PRECISION;
  v_investment RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required' USING ERRCODE = '42501';
  END IF;

  IF p_pot_id IS NULL OR p_minutes IS NULL OR p_minutes < 1 THEN
    RAISE EXCEPTION 'Pot ID and a positive whole number of minutes are required' USING ERRCODE = '22023';
  END IF;

  SELECT creation_date, current_score, target_minutes_per_day, difficulty
  INTO v_creation_date, v_previous_score, v_target_minutes, v_difficulty
  FROM public.pots
  WHERE id = p_pot_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pot not found' USING ERRCODE = 'P0002';
  END IF;

  v_score_date := (v_logged_at AT TIME ZONE 'UTC')::DATE;

  INSERT INTO public.logs (pot_id, coins_invested, log_date, invested_at)
  VALUES (p_pot_id, p_minutes, v_score_date, v_logged_at)
  RETURNING id INTO v_log_id;

  SELECT COALESCE(SUM(coins_invested), 0)::INTEGER
  INTO v_daily_minutes
  FROM public.logs
  WHERE pot_id = p_pot_id AND log_date = v_score_date;

  SELECT invested_at
  INTO v_previous_investment_at
  FROM public.logs
  WHERE pot_id = p_pot_id AND log_date < v_score_date
  ORDER BY invested_at DESC
  LIMIT 1;

  SELECT base_score
  INTO v_base_score
  FROM public.pot_daily_scores
  WHERE pot_id = p_pot_id AND score_date = v_score_date;

  IF FOUND THEN
    v_effective_gap := 0;
  ELSE
    v_base_score := v_previous_score;

    IF v_previous_investment_at IS NOT NULL THEN
      v_current_window := FLOOR(EXTRACT(EPOCH FROM (v_logged_at - v_creation_date)) / 604800)::INTEGER;
      v_previous_window := FLOOR(EXTRACT(EPOCH FROM (v_previous_investment_at - v_creation_date)) / 604800)::INTEGER;

      IF v_current_window <> v_previous_window THEN
        v_effective_gap := ROUND(GREATEST(0, EXTRACT(EPOCH FROM (v_logged_at - v_previous_investment_at)) / 86400)::NUMERIC, 4);
      END IF;
    END IF;
  END IF;

  FOR v_investment IN
    SELECT DISTINCT ON (log_date) invested_at
    FROM public.logs
    WHERE pot_id = p_pot_id
    ORDER BY log_date, invested_at
  LOOP
    IF v_last_streak_investment_at IS NOT NULL THEN
      v_current_window := FLOOR(EXTRACT(EPOCH FROM (v_investment.invested_at - v_creation_date)) / 604800)::INTEGER;
      v_previous_window := FLOOR(EXTRACT(EPOCH FROM (v_last_streak_investment_at - v_creation_date)) / 604800)::INTEGER;

      IF v_current_window <> v_previous_window THEN
        v_streak_gap := ROUND(GREATEST(0, EXTRACT(EPOCH FROM (v_investment.invested_at - v_last_streak_investment_at)) / 86400)::NUMERIC, 4);
        v_streak_days := GREATEST(0, v_streak_days - v_streak_gap);
      END IF;
    END IF;

    v_streak_days := v_streak_days + 1;
    v_last_streak_investment_at := v_investment.invested_at;
  END LOOP;

  v_curve_steepness := 0.05 + (LEAST(GREATEST(v_difficulty, 1), 10) - 1) * 0.012;
  v_daily_reward := ROUND(
    (v_daily_minutes::DOUBLE PRECISION / GREATEST(v_target_minutes, 1))
    * (1 + 3 / (1 + EXP(-v_curve_steepness * (v_streak_days - 15))))
  , 4);
  v_current_score := ROUND(v_base_score * EXP(-0.1 * v_effective_gap) + v_daily_reward, 4);

  INSERT INTO public.pot_daily_scores (
    pot_id, score_date, base_score, daily_minutes, daily_reward, effective_gap, streak_days, updated_at
  ) VALUES (
    p_pot_id, v_score_date, v_base_score, v_daily_minutes, v_daily_reward, v_effective_gap, v_streak_days, now()
  ) ON CONFLICT (pot_id, score_date) DO UPDATE SET
    daily_minutes = EXCLUDED.daily_minutes,
    daily_reward = EXCLUDED.daily_reward,
    effective_gap = EXCLUDED.effective_gap,
    streak_days = EXCLUDED.streak_days,
    updated_at = now();

  UPDATE public.pots
  SET current_score = v_current_score, current_gap_days = 0
  WHERE id = p_pot_id;

  RETURN QUERY SELECT
    v_log_id,
    v_score_date,
    v_daily_minutes,
    v_current_score,
    v_daily_reward,
    v_effective_gap,
    v_streak_days;
END;
$$;

REVOKE ALL ON FUNCTION public.log_time_investment(UUID, INTEGER, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_time_investment(UUID, INTEGER, TIMESTAMPTZ) TO authenticated;

-- This routine is intentionally not called while rendering a page. Schedule it
-- with a service-role job to keep warning values current for inactive pots.
CREATE OR REPLACE FUNCTION public.refresh_current_gap_days(p_as_of TIMESTAMPTZ DEFAULT now())
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.pots AS p
  SET current_gap_days = GREATEST(
    0,
    FLOOR(EXTRACT(EPOCH FROM (
      p_as_of - COALESCE(
        (SELECT invested_at FROM public.logs WHERE pot_id = p.id ORDER BY invested_at DESC LIMIT 1),
        p.creation_date
      )
    )) / 86400)::INTEGER
  );
$$;

REVOKE ALL ON FUNCTION public.refresh_current_gap_days(TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_current_gap_days(TIMESTAMPTZ) TO service_role;
