-- Debug script to understand which data source is being used for celebration page
-- Run this with your user_id to see what data is available

-- Replace 'YOUR_USER_ID' with the actual user ID
-- You can get your user ID from: SELECT auth.uid();

-- 1. Check if user has data in desafios_diarios table
SELECT 
  'desafios_diarios' as source,
  COUNT(*) as records_count,
  SUM(pontuacao_total) as total_from_pontuacao_total,
  MIN(data) as first_date,
  MAX(data) as last_date
FROM desafios_diarios 
WHERE user_id = auth.uid()
HAVING COUNT(*) > 0;

-- 2. Check user data in ranking view
SELECT 
  'ranking_view' as source,
  legacy_points,
  total_challenge_points,
  total_points,
  days_completed
FROM ranking_with_challenge_progress 
WHERE user_id = auth.uid();

-- 3. Check user data in pontuacoes table (legacy)
SELECT 
  'pontuacoes' as source,
  pontuacao_total as legacy_points
FROM pontuacoes 
WHERE user_id = auth.uid();

-- 4. Check user data in daily_progress table (new system)
SELECT 
  'daily_progress' as source,
  COUNT(*) as records_count,
  SUM(points_earned) as total_points_earned,
  MIN(date) as first_date,
  MAX(date) as last_date
FROM daily_progress 
WHERE user_id = auth.uid()
HAVING COUNT(*) > 0;

-- 5. Show the difference between sources
WITH user_data AS (
  SELECT auth.uid() as user_id
),
desafios_total AS (
  SELECT COALESCE(SUM(pontuacao_total), 0) as desafios_total
  FROM desafios_diarios d, user_data u
  WHERE d.user_id = u.user_id
),
ranking_data AS (
  SELECT 
    COALESCE(total_points, 0) as ranking_total,
    COALESCE(legacy_points, 0) as ranking_legacy,
    COALESCE(total_challenge_points, 0) as ranking_challenge
  FROM ranking_with_challenge_progress r, user_data u
  WHERE r.user_id = u.user_id
)
SELECT 
  d.desafios_total,
  r.ranking_total,
  r.ranking_legacy,
  r.ranking_challenge,
  (r.ranking_total - d.desafios_total) as difference,
  CASE 
    WHEN d.desafios_total > 0 THEN 'Using desafios_diarios (may be wrong)'
    WHEN r.ranking_total > 0 THEN 'Using ranking_view (correct)'
    ELSE 'No data found'
  END as current_logic_uses
FROM desafios_total d, ranking_data r;