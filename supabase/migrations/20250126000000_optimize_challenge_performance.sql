-- Migration: Optimize challenge system performance
-- This migration adds additional indexes and optimizations for better performance

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_challenge_status 
ON public.profiles(user_id, challenge_start_date, challenge_completed_at)
WHERE challenge_start_date IS NOT NULL;

-- Optimize daily_progress queries
CREATE INDEX IF NOT EXISTS idx_daily_progress_points_lookup 
ON public.daily_progress(user_id, points_earned)
WHERE points_earned > 0;

-- Index for ranking queries (most common access pattern)
CREATE INDEX IF NOT EXISTS idx_daily_progress_ranking 
ON public.daily_progress(user_id, points_earned DESC, challenge_day);

-- Partial index for active challenges only
CREATE INDEX IF NOT EXISTS idx_profiles_active_challenges_only
ON public.profiles(user_id, challenge_start_date)
WHERE challenge_start_date IS NOT NULL AND challenge_completed_at IS NULL;

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_progress_date_user 
ON public.daily_progress(date DESC, user_id);

-- Optimize the ranking view with materialized view for better performance
DROP VIEW IF EXISTS public.ranking_with_challenge_progress;

CREATE MATERIALIZED VIEW public.ranking_with_challenge_progress AS
SELECT 
  p.user_id,
  p.nome,
  p.foto_url,
  p.challenge_start_date,
  p.challenge_completed_at,
  COALESCE(SUM(dp.points_earned), 0) as total_challenge_points,
  COUNT(dp.challenge_day) as days_completed,
  -- Include legacy points from pontuacoes table for backward compatibility
  COALESCE(pt.pontuacao_total, 0) as legacy_points,
  COALESCE(SUM(dp.points_earned), 0) + COALESCE(pt.pontuacao_total, 0) as total_points
FROM public.profiles p
LEFT JOIN public.daily_progress dp ON p.user_id = dp.user_id
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE p.challenge_start_date IS NOT NULL
GROUP BY p.user_id, p.nome, p.foto_url, p.challenge_start_date, p.challenge_completed_at, pt.pontuacao_total
ORDER BY total_points DESC;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_ranking_materialized_user_id 
ON public.ranking_with_challenge_progress(user_id);

-- Create index for fast ordering
CREATE INDEX idx_ranking_materialized_points 
ON public.ranking_with_challenge_progress(total_points DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_ranking_view()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ranking_with_challenge_progress;
END;
$$;

-- Trigger to refresh materialized view when data changes
CREATE OR REPLACE FUNCTION public.trigger_refresh_ranking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use pg_notify to trigger async refresh
  PERFORM pg_notify('refresh_ranking', '');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for automatic refresh
DROP TRIGGER IF EXISTS trigger_refresh_ranking_on_daily_progress ON public.daily_progress;
CREATE TRIGGER trigger_refresh_ranking_on_daily_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.daily_progress
  FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_ranking();

DROP TRIGGER IF EXISTS trigger_refresh_ranking_on_profiles ON public.profiles;
CREATE TRIGGER trigger_refresh_ranking_on_profiles
  AFTER UPDATE OF challenge_start_date, challenge_completed_at ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_ranking();

-- Optimized function for getting user challenge summary
CREATE OR REPLACE FUNCTION public.get_user_challenge_summary(user_id_param UUID)
RETURNS TABLE (
  user_id UUID,
  challenge_start_date TIMESTAMPTZ,
  challenge_completed_at TIMESTAMPTZ,
  current_day INTEGER,
  total_points INTEGER,
  days_with_progress INTEGER,
  last_activity_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.challenge_start_date,
    p.challenge_completed_at,
    CASE 
      WHEN p.challenge_start_date IS NULL THEN 0
      WHEN p.challenge_completed_at IS NOT NULL THEN 7
      ELSE LEAST(GREATEST(EXTRACT(DAY FROM (NOW() AT TIME ZONE 'America/Sao_Paulo') - (p.challenge_start_date AT TIME ZONE 'America/Sao_Paulo'))::INTEGER, 0), 7)
    END as current_day,
    COALESCE(SUM(dp.points_earned), 0)::INTEGER as total_points,
    COUNT(dp.challenge_day)::INTEGER as days_with_progress,
    MAX(dp.date) as last_activity_date
  FROM public.profiles p
  LEFT JOIN public.daily_progress dp ON p.user_id = dp.user_id
  WHERE p.user_id = user_id_param
  GROUP BY p.user_id, p.challenge_start_date, p.challenge_completed_at;
END;
$$;

-- Optimized function for bulk ranking data
CREATE OR REPLACE FUNCTION public.get_ranking_bulk(limit_param INTEGER DEFAULT 100)
RETURNS TABLE (
  user_id UUID,
  nome TEXT,
  foto_url TEXT,
  challenge_start_date TIMESTAMPTZ,
  challenge_completed_at TIMESTAMPTZ,
  total_points BIGINT,
  rank_position INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.user_id,
    r.nome,
    r.foto_url,
    r.challenge_start_date,
    r.challenge_completed_at,
    r.total_points,
    ROW_NUMBER() OVER (ORDER BY r.total_points DESC)::INTEGER as rank_position
  FROM public.ranking_with_challenge_progress r
  ORDER BY r.total_points DESC
  LIMIT limit_param;
END;
$$;

-- Function to get points breakdown efficiently
CREATE OR REPLACE FUNCTION public.get_points_breakdown(user_id_param UUID)
RETURNS TABLE (
  challenge_day INTEGER,
  points_earned INTEGER,
  tasks_completed JSONB,
  date DATE,
  cumulative_points BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.challenge_day,
    dp.points_earned,
    dp.tasks_completed,
    dp.date,
    SUM(dp.points_earned) OVER (ORDER BY dp.challenge_day ROWS UNBOUNDED PRECEDING) as cumulative_points
  FROM public.daily_progress dp
  WHERE dp.user_id = user_id_param
  ORDER BY dp.challenge_day;
END;
$$;

-- Add statistics for query planner optimization
ANALYZE public.profiles;
ANALYZE public.daily_progress;

-- Grant permissions
GRANT SELECT ON public.ranking_with_challenge_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_ranking_view() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_challenge_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ranking_bulk(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_points_breakdown(UUID) TO authenticated;

-- Initial refresh of materialized view
SELECT public.refresh_ranking_view();

-- Add comments
COMMENT ON MATERIALIZED VIEW public.ranking_with_challenge_progress IS 'Materialized view for optimized ranking queries with automatic refresh triggers';
COMMENT ON FUNCTION public.refresh_ranking_view() IS 'Manually refresh the ranking materialized view';
COMMENT ON FUNCTION public.get_user_challenge_summary(UUID) IS 'Get comprehensive user challenge summary in a single query';
COMMENT ON FUNCTION public.get_ranking_bulk(INTEGER) IS 'Get ranking data efficiently with position numbers';
COMMENT ON FUNCTION public.get_points_breakdown(UUID) IS 'Get user points breakdown with cumulative totals';