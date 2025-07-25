-- =====================================================
-- SCRIPT PARA ATUALIZAR SISTEMA DE PONTUAÇÃO DOS DESAFIOS
-- Execute essas queries no painel do Supabase (SQL Editor)
-- =====================================================

-- 1. Adicionar novos campos de desafio à tabela desafios_diarios
ALTER TABLE public.desafios_diarios 
ADD COLUMN IF NOT EXISTS evitar_ultraprocessados BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dormir_sem_celular BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS organizar_refeicoes BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Criar função para calcular pontuação baseada nos novos valores
CREATE OR REPLACE FUNCTION public.calcular_pontuacao_desafio(
  hidratacao BOOLEAN,
  sono_qualidade BOOLEAN,
  evitar_ultraprocessados BOOLEAN,
  dormir_sem_celular BOOLEAN,
  atividade_fisica BOOLEAN,
  seguiu_dieta BOOLEAN,
  registro_visual BOOLEAN,
  organizar_refeicoes BOOLEAN
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 
    (CASE WHEN hidratacao THEN 100 ELSE 0 END) +
    (CASE WHEN sono_qualidade THEN 100 ELSE 0 END) +
    (CASE WHEN evitar_ultraprocessados THEN 150 ELSE 0 END) +
    (CASE WHEN dormir_sem_celular THEN 150 ELSE 0 END) +
    (CASE WHEN atividade_fisica THEN 200 ELSE 0 END) +
    (CASE WHEN seguiu_dieta THEN 200 ELSE 0 END) +
    (CASE WHEN registro_visual THEN 250 ELSE 0 END) +
    (CASE WHEN organizar_refeicoes THEN 250 ELSE 0 END);
END;
$$;

-- 3. Criar função para atualizar automaticamente a pontuação quando um desafio for modificado
CREATE OR REPLACE FUNCTION public.atualizar_pontuacao_desafio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular nova pontuação
  NEW.pontuacao_total = public.calcular_pontuacao_desafio(
    NEW.hidratacao,
    NEW.sono_qualidade,
    NEW.evitar_ultraprocessados,
    NEW.dormir_sem_celular,
    NEW.atividade_fisica,
    NEW.seguiu_dieta,
    NEW.registro_visual,
    NEW.organizar_refeicoes
  );
  
  RETURN NEW;
END;
$$;

-- 4. Criar trigger para executar antes de INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_atualizar_pontuacao_desafio ON public.desafios_diarios;
CREATE TRIGGER trigger_atualizar_pontuacao_desafio
  BEFORE INSERT OR UPDATE ON public.desafios_diarios
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_pontuacao_desafio();

-- 5. Atualizar pontuações existentes com base no novo sistema
UPDATE public.desafios_diarios 
SET pontuacao_total = public.calcular_pontuacao_desafio(
  hidratacao,
  sono_qualidade,
  evitar_ultraprocessados,
  dormir_sem_celular,
  atividade_fisica,
  seguiu_dieta,
  registro_visual,
  organizar_refeicoes
);

-- 6. Criar função para recalcular pontuação total do usuário
CREATE OR REPLACE FUNCTION public.recalcular_pontuacao_usuario(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pontuacoes 
  SET pontuacao_total = (
    SELECT COALESCE(SUM(pontuacao_total), 0)
    FROM public.desafios_diarios 
    WHERE user_id = user_id_param
  )
  WHERE user_id = user_id_param;
END;
$$;

-- 7. Recalcular pontuações totais de todos os usuários
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM public.desafios_diarios LOOP
    PERFORM public.recalcular_pontuacao_usuario(user_record.user_id);
  END LOOP;
END;
$$;

-- =====================================================
-- VERIFICAÇÃO DOS RESULTADOS
-- Execute essas queries para verificar se tudo funcionou:
-- =====================================================

-- Verificar se os novos campos foram adicionados
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'desafios_diarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar pontuações atualizadas (exemplo)
SELECT 
  id,
  hidratacao,
  sono_qualidade,
  evitar_ultraprocessados,
  dormir_sem_celular,
  atividade_fisica,
  seguiu_dieta,
  registro_visual,
  organizar_refeicoes,
  pontuacao_total,
  -- Verificar se a pontuação está correta
  public.calcular_pontuacao_desafio(
    hidratacao,
    sono_qualidade,
    evitar_ultraprocessados,
    dormir_sem_celular,
    atividade_fisica,
    seguiu_dieta,
    registro_visual,
    organizar_refeicoes
  ) as pontuacao_calculada
FROM public.desafios_diarios 
LIMIT 10;

-- Verificar pontuações totais dos usuários
SELECT 
  p.user_id,
  pr.nome,
  p.pontuacao_total,
  p.dias_consecutivos
FROM public.pontuacoes p
JOIN public.profiles pr ON p.user_id = pr.user_id
ORDER BY p.pontuacao_total DESC
LIMIT 10;