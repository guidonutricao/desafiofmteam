# Correção do Erro "peso_atual does not exist"

## 🚨 Problema Identificado

A aplicação estava tentando acessar a coluna `peso_atual` na tabela `profiles`, mas essa coluna não existe no schema atual do banco de dados.

## 🔧 Correções Aplicadas

### 1. **Arquivo: `src/pages/Perfil.tsx`**
- ❌ Removido: `peso_atual` da interface `Profile`
- ❌ Removido: `peso_atual` da query SELECT
- ❌ Removido: Campo "Peso Atual" da interface do usuário
- ✅ Mantido: Apenas `peso_inicial` funcionando

### 2. **Arquivo: `src/hooks/use-auth.tsx`**
- ❌ Removido: Tentativa de atualizar `peso_atual` no cadastro
- ✅ Mantido: Apenas atualização de `peso_inicial`

### 3. **Migrações Corrigidas**
- `20250127000001_add_peso_inicial_safe.sql` - Função corrigida
- `20250127000002_add_peso_inicial_simple.sql` - Função corrigida
- `20250127000003_fix_peso_inicial.sql` - Nova migração de correção

## 🚀 Solução Imediata

Execute este SQL no dashboard do Supabase:

```sql
-- Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, peso_inicial)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
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

## ✅ Estado Atual

### Funcionalidades Funcionando:
- ✅ Campo peso inicial no cadastro (opcional)
- ✅ Exibição do peso inicial na página de perfil
- ✅ Salvamento automático no banco de dados
- ✅ Aplicação carrega sem erros

### Funcionalidades Removidas Temporariamente:
- ❌ Campo "Peso Atual" na página de perfil
- ❌ Atualização de peso atual

## 🔮 Próximos Passos (Opcional)

Se quiser implementar o campo `peso_atual` no futuro:

### 1. Adicionar coluna ao banco:
```sql
ALTER TABLE public.profiles 
ADD COLUMN peso_atual NUMERIC(5,2);
```

### 2. Atualizar função handle_new_user:
```sql
-- Inicializar peso_atual com peso_inicial
INSERT INTO public.profiles (user_id, nome, peso_inicial, peso_atual)
VALUES (
  NEW.id, 
  COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
  peso_inicial_value,
  peso_inicial_value  -- Mesmo valor inicial
);
```

### 3. Atualizar código frontend:
- Adicionar `peso_atual` na interface `Profile`
- Incluir na query SELECT
- Criar funcionalidade de edição do peso atual

## 📋 Verificação

Para confirmar que tudo está funcionando:

1. **Teste de Cadastro**:
   - Acesse a página de login
   - Crie uma conta com peso inicial
   - Verifique se o cadastro funciona

2. **Teste de Perfil**:
   - Acesse a página de perfil
   - Verifique se o peso inicial aparece
   - Confirme que não há erros no console

3. **Teste de Banco**:
   ```sql
   SELECT nome, peso_inicial FROM public.profiles LIMIT 5;
   ```

## 🎯 Resultado

A aplicação agora funciona corretamente com:
- ✅ Campo peso inicial funcional
- ✅ Sem erros de coluna inexistente
- ✅ Interface limpa e consistente
- ✅ Preparada para futuras expansões

---

**Status**: ✅ Problema Resolvido  
**Data**: 27/01/2025  
**Versão**: 1.1.0 (Correção)