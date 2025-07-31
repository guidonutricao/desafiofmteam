-- Test script to verify celebration score calculation
-- Replace 'USER_ID_HERE' with actual user ID

-- 1. Check desafios_diarios table data
SELECT 
  'desafios_diarios' as source,
  data,
  pontuacao_total,
  hidratacao,
  sono_qualidade,
  atividade_fisica,
  seguiu_dieta,
  registro_visual
FROM desafios_diarios 
WHERE user_id = 'USER_ID_HERE'
ORDER BY data ASC;

-- 2. Calculate total score from desafios_diarios
SELECT 
  'Total from desafios_diarios' as calculation,
  COUNT(*) as total_days,
  SUM(pontuacao_total) as total_score,
  AVG(pontuacao_total) as average_score
FROM desafios_diarios 
WHERE user_id = 'USER_ID_HERE';

-- 3. Check pontuacoes table as fallback
SELECT 
  'pontuacoes' as source,
  pontuacao_total,
  created_at,
  updated_at
FROM pontuacoes 
WHERE user_id = 'USER_ID_HERE';

-- 4. Check user profile
SELECT 
  'profile' as source,
  nome,
  created_at
FROM profiles 
WHERE user_id = 'USER_ID_HERE';

-- 5. Detailed breakdown by day
SELECT 
  'Daily breakdown' as info,
  data,
  pontuacao_total,
  CASE 
    WHEN hidratacao THEN 'Hidratação ✓' 
    ELSE 'Hidratação ✗' 
  END as hidratacao_status,
  CASE 
    WHEN sono_qualidade THEN 'Sono ✓' 
    ELSE 'Sono ✗' 
  END as sono_status,
  CASE 
    WHEN atividade_fisica THEN 'Atividade ✓' 
    ELSE 'Atividade ✗' 
  END as atividade_status,
  CASE 
    WHEN seguiu_dieta THEN 'Dieta ✓' 
    ELSE 'Dieta ✗' 
  END as dieta_status,
  CASE 
    WHEN registro_visual THEN 'Registro ✓' 
    ELSE 'Registro ✗' 
  END as registro_status,
  (
    CASE WHEN hidratacao THEN 1 ELSE 0 END +
    CASE WHEN sono_qualidade THEN 1 ELSE 0 END +
    CASE WHEN atividade_fisica THEN 1 ELSE 0 END +
    CASE WHEN seguiu_dieta THEN 1 ELSE 0 END +
    CASE WHEN registro_visual THEN 1 ELSE 0 END
  ) as tasks_completed_count
FROM desafios_diarios 
WHERE user_id = 'USER_ID_HERE'
ORDER BY data ASC;

-- 6. Summary statistics
SELECT 
  'Summary' as info,
  COUNT(*) as total_records,
  SUM(pontuacao_total) as total_score,
  ROUND(AVG(pontuacao_total), 2) as avg_daily_score,
  MIN(pontuacao_total) as min_score,
  MAX(pontuacao_total) as max_score,
  COUNT(CASE WHEN pontuacao_total > 0 THEN 1 END) as days_with_activity
FROM desafios_diarios 
WHERE user_id = 'USER_ID_HERE';