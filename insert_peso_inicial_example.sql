-- Exemplo de query para inserir peso inicial no momento do cadastro
-- Esta query seria executada automaticamente pela função handle_new_user()

-- Inserir um novo perfil com peso inicial
INSERT INTO public.profiles (user_id, nome, peso_inicial, peso_atual, created_at, updated_at)
VALUES (
  '[USER_ID]', -- UUID do usuário do auth.users
  '[NOME_USUARIO]', -- Nome fornecido no cadastro
  75.5, -- Peso inicial em kg
  75.5, -- Peso atual (inicialmente igual ao peso inicial)
  NOW(),
  NOW()
);

-- Exemplo de atualização do peso inicial após o cadastro (caso necessário)
UPDATE public.profiles 
SET 
  peso_inicial = 80.0,
  peso_atual = 80.0,
  updated_at = NOW()
WHERE user_id = '[USER_ID]'
AND peso_inicial IS NULL; -- Só atualiza se ainda não foi definido

-- Query para verificar perfis com peso inicial
SELECT 
  user_id,
  nome,
  peso_inicial,
  peso_atual,
  created_at
FROM public.profiles 
WHERE peso_inicial IS NOT NULL
ORDER BY created_at DESC;

-- Query para estatísticas de peso inicial dos usuários
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(peso_inicial) as usuarios_com_peso,
  AVG(peso_inicial) as peso_medio,
  MIN(peso_inicial) as peso_minimo,
  MAX(peso_inicial) as peso_maximo
FROM public.profiles;