# Guia de Solução de Problemas - Peso Inicial

## ❌ Erro: "column peso_inicial does not exist"

### Problema
A migração falhou porque a função `handle_new_user()` está tentando usar a coluna `peso_inicial` antes dela ser criada.

### Soluções

#### Opção 1: Migração Manual (Recomendada)
Execute os comandos SQL diretamente no dashboard do Supabase na seguinte ordem:

```sql
-- 1. Adicionar coluna peso_inicial
ALTER TABLE public.profiles 
ADD COLUMN peso_inicial NUMERIC(5,2);

-- 2. Adicionar comentário
COMMENT ON COLUMN public.profiles.peso_inicial IS 'Initial weight recorded during user registration (in kg)';

-- 3. Criar índice
CREATE INDEX idx_profiles_peso_inicial ON public.profiles(peso_inicial);

-- 4. Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, peso_inicial, peso_atual)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
      ELSE NULL
    END
  );
  
  INSERT INTO public.pontuacoes (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;
```

#### Opção 2: Usar Migração Simplificada
Use o arquivo `supabase/migrations/20250127000002_add_peso_inicial_simple.sql`:

```bash
# No terminal do Supabase CLI
supabase db reset
# ou
supabase migration up
```

#### Opção 3: Verificar Estado Atual
Antes de aplicar qualquer migração, verifique o estado atual:

```sql
-- Verificar se a coluna já existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- Verificar função atual
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
```

## 🔧 Verificação Pós-Migração

### 1. Testar Estrutura da Tabela
```sql
-- Deve retornar a coluna peso_inicial
DESCRIBE public.profiles;
-- ou
SELECT * FROM public.profiles LIMIT 0;
```

### 2. Testar Função
```sql
-- Verificar se a função foi atualizada
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### 3. Testar Inserção Manual
```sql
-- Teste de inserção (substitua pelo UUID real)
INSERT INTO public.profiles (user_id, nome, peso_inicial, peso_atual)
VALUES (
  gen_random_uuid(),
  'Teste',
  75.5,
  75.5
);
```

## 🚨 Problemas Comuns

### Problema: "column profiles.peso_atual does not exist"
**Sintomas**: Aplicação não carrega, erro na página de perfil
**Causa**: Código tentando acessar coluna peso_atual que não existe
**Solução Imediata**: 
1. Execute o arquivo `fix_peso_inicial_immediate.sql` no dashboard do Supabase
2. Reinicie a aplicação
3. A funcionalidade funcionará apenas com peso_inicial

### Problema: Migração não aplicada
**Sintomas**: Erro "column does not exist" persiste
**Solução**: 
1. Verifique se está conectado ao banco correto
2. Execute a migração manualmente no dashboard
3. Verifique permissões do usuário

### Problema: Função não atualizada
**Sintomas**: Usuários novos não têm peso_inicial salvo
**Solução**:
1. Execute apenas a parte da função da migração
2. Verifique se o trigger está ativo
3. Teste com usuário novo

### Problema: Dados existentes
**Sintomas**: Usuários antigos não têm peso_inicial
**Solução**:
```sql
-- Atualizar usuários existentes (opcional)
UPDATE public.profiles 
SET peso_inicial = peso_atual 
WHERE peso_inicial IS NULL 
AND peso_atual IS NOT NULL;
```

## 📋 Checklist de Verificação

- [ ] Coluna `peso_inicial` existe na tabela `profiles`
- [ ] Índice `idx_profiles_peso_inicial` foi criado
- [ ] Função `handle_new_user()` foi atualizada
- [ ] Trigger `on_auth_user_created` está ativo
- [ ] Teste de cadastro funciona
- [ ] Dados aparecem na página de perfil

## 🔄 Rollback (Se Necessário)

Se precisar reverter as mudanças:

```sql
-- Remover coluna (CUIDADO: perde dados)
ALTER TABLE public.profiles DROP COLUMN peso_inicial;

-- Remover índice
DROP INDEX IF EXISTS idx_profiles_peso_inicial;

-- Restaurar função original
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'));
  
  INSERT INTO public.pontuacoes (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;
```

## 📞 Suporte

Se os problemas persistirem:

1. **Verifique logs do Supabase**: Dashboard > Logs > Database
2. **Teste conexão**: Verifique se consegue acessar outras tabelas
3. **Permissões**: Confirme que tem permissões de admin no banco
4. **Versão**: Verifique se está usando versão compatível do Supabase

## 🎯 Teste Final

Execute este teste para confirmar que tudo funciona:

```javascript
// Teste rápido no console do navegador
const { data, error } = await supabase
  .from('profiles')
  .select('nome, peso_inicial, peso_atual')
  .limit(1);

console.log('Teste:', { data, error });
```

Se retornar sem erro e mostrar as colunas, a migração foi bem-sucedida! ✅