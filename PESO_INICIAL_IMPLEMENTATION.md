# Implementação do Campo Peso Inicial

## Resumo das Mudanças

Este documento descreve as mudanças implementadas para incluir o campo de **peso inicial** no fluxo de criação de conta.

## 📁 Arquivos Modificados

### 1. **Migração do Banco de Dados**
- **Arquivo**: `supabase/migrations/20250127000000_add_peso_inicial.sql`
- **Mudanças**:
  - Adicionado campo `peso_inicial NUMERIC(5,2)` na tabela `profiles`
  - Atualizada função `handle_new_user()` para capturar peso inicial dos metadados
  - Criado índice para otimização de consultas

### 2. **Hook de Autenticação**
- **Arquivo**: `src/hooks/use-auth.tsx`
- **Mudanças**:
  - Atualizada interface `AuthContextType` para incluir parâmetro `pesoInicial` opcional
  - Modificada função `signUp()` para aceitar e processar peso inicial
  - Implementada lógica para salvar peso inicial no perfil após criação do usuário

### 3. **Página de Login/Cadastro**
- **Arquivo**: `src/pages/Login.tsx`
- **Mudanças**:
  - Adicionado campo "Peso inicial (kg)" no formulário de cadastro
  - Implementada validação e conversão do peso para número
  - Campo é opcional para não impedir cadastros

### 4. **Página de Perfil**
- **Arquivo**: `src/pages/Perfil.tsx`
- **Mudanças**:
  - Atualizada interface `Profile` para incluir `peso_inicial` e `peso_atual`
  - Modificada query para buscar campos de peso
  - Adicionadas seções para exibir peso inicial e atual (somente leitura)

## 🔧 Funcionalidades Implementadas

### ✅ Durante o Cadastro
1. **Campo Opcional**: Usuário pode informar peso inicial durante o cadastro
2. **Validação**: Campo aceita valores decimais entre 30-300 kg
3. **Persistência**: Peso é salvo automaticamente na tabela `profiles`
4. **Inicialização**: Peso atual é inicializado com o mesmo valor do peso inicial

### ✅ Na Página de Perfil
1. **Exibição**: Peso inicial é mostrado como campo somente leitura
2. **Diferenciação**: Peso inicial e atual são exibidos separadamente
3. **Proteção**: Peso inicial não pode ser alterado após o cadastro
4. **Feedback**: Mensagens explicativas sobre cada campo

### ✅ No Banco de Dados
1. **Estrutura**: Campo `peso_inicial` adicionado à tabela `profiles`
2. **Trigger**: Função `handle_new_user()` processa peso inicial automaticamente
3. **Índice**: Otimização para consultas por peso inicial
4. **Integridade**: Peso inicial preservado em atualizações futuras

## 📊 Estrutura do Banco

```sql
-- Tabela profiles (campos relacionados ao peso)
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  peso_inicial NUMERIC(5,2),  -- ✨ NOVO CAMPO
  peso_atual NUMERIC(5,2),
  -- outros campos...
);
```

## 🔄 Fluxo de Funcionamento

### 1. **Cadastro de Usuário**
```typescript
// Usuário preenche formulário com peso inicial
const pesoInicial = 75.5;

// Função signUp processa os dados
await signUp(email, password, nome, pesoInicial);

// Dados são salvos nos metadados do auth
{
  nome: "João Silva",
  peso_inicial: 75.5
}
```

### 2. **Criação Automática do Perfil**
```sql
-- Trigger handle_new_user() executa automaticamente
INSERT INTO public.profiles (user_id, nome, peso_inicial, peso_atual)
VALUES (
  NEW.id,
  'João Silva',
  75.5,  -- peso inicial
  75.5   -- peso atual (inicialmente igual)
);
```

### 3. **Exibição no Perfil**
```typescript
// Dados carregados na página de perfil
const profile = {
  nome: "João Silva",
  peso_inicial: 75.5,  // Somente leitura
  peso_atual: 75.5     // Pode ser editado futuramente
};
```

## 🧪 Testes

### Arquivo de Teste
- **Arquivo**: `test_peso_inicial.js`
- **Funcionalidades testadas**:
  - Criação de usuário com peso inicial
  - Verificação da persistência no banco
  - Atualização do peso atual sem afetar o inicial
  - Limpeza dos dados de teste

### Como Executar
```bash
node test_peso_inicial.js
```

## 📝 Queries de Exemplo

### Inserir Peso Inicial Manualmente
```sql
UPDATE public.profiles 
SET 
  peso_inicial = 80.0,
  peso_atual = 80.0
WHERE user_id = '[USER_ID]'
AND peso_inicial IS NULL;
```

### Consultar Usuários com Peso Inicial
```sql
SELECT nome, peso_inicial, peso_atual, created_at
FROM public.profiles 
WHERE peso_inicial IS NOT NULL
ORDER BY created_at DESC;
```

### Estatísticas de Peso
```sql
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(peso_inicial) as usuarios_com_peso,
  AVG(peso_inicial) as peso_medio
FROM public.profiles;
```

## 🚀 Próximos Passos

1. **Edição do Peso Atual**: Implementar funcionalidade para usuário atualizar peso atual
2. **Histórico de Peso**: Criar tabela para rastrear evolução do peso
3. **Validações Avançadas**: Adicionar validações mais robustas no frontend
4. **Relatórios**: Criar dashboards com estatísticas de peso dos usuários

## ⚠️ Considerações Importantes

1. **Privacidade**: Peso inicial é informação sensível, garantir proteção adequada
2. **Opcional**: Campo é opcional para não impedir cadastros
3. **Imutabilidade**: Peso inicial não deve ser alterado após cadastro
4. **Validação**: Implementar validações tanto no frontend quanto no backend
5. **Backup**: Considerar backup dos dados antes de aplicar migrações

---

**Status**: ✅ Implementação Completa
**Data**: 27/01/2025
**Versão**: 1.0.0