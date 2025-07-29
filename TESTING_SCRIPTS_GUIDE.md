# Guia dos Scripts de Teste do Dashboard

## 🚨 Problema Identificado

O erro `CHALLENGE_NOT_STARTED` ocorre devido a um trigger que impede inserção de dados antes do usuário iniciar oficialmente o desafio.

## 📝 Scripts Disponíveis para Teste

### 1. `test_dashboard_simple.sql` ⭐ **RECOMENDADO**
**Mais simples e seguro**
- Usa apenas a tabela `pontuacoes`
- Evita triggers de validação
- Dashboard cria distribuição simulada de 7 dias

```sql
-- Executa sem problemas
\i test_dashboard_simple.sql
```

### 2. `test_dashboard_real_user.sql` 👤 **PARA USUÁRIOS REAIS**
**Para testar com usuário existente**
- Lista usuários disponíveis
- Adiciona pontuação para teste
- Funciona com login real

```sql
-- Primeiro vê usuários disponíveis
\i test_dashboard_real_user.sql
-- Depois segue as instruções
```

### 3. `bypass_trigger_test.sql` 🔧 **AVANÇADO**
**Contorna os triggers (requer permissões admin)**
- Desabilita triggers temporariamente
- Insere dados detalhados por dia
- Reabilita triggers automaticamente

```sql
-- Requer permissões de admin
\i bypass_trigger_test.sql
```

### 4. `test_7_days_dashboard.sql` ❌ **COM PROBLEMA**
**Script original que gera erro**
- Não funciona devido aos triggers
- Mantido para referência

## 🎯 Recomendação de Uso

### Para Teste Rápido
```bash
# Execute este primeiro
psql -f test_dashboard_simple.sql

# Depois:
# 1. Navegue para página de Perfil
# 2. Veja dashboard com 7 dias
# 3. Pontuação distribuída: ~485 pontos por dia
```

### Para Teste com Usuário Real
```bash
# 1. Execute para ver usuários
psql -f test_dashboard_real_user.sql

# 2. Copie um user_id da lista
# 3. Edite o script e descomente o bloco DO $$
# 4. Substitua o user_id
# 5. Execute novamente
```

### Para Teste Detalhado (Admin)
```bash
# Requer permissões de superuser
psql -f bypass_trigger_test.sql

# Resultado: dados detalhados por dia
# Dias 1,3,5,7 com pontos
# Dias 2,4,6 vazios (0 pontos)
```

## 🔍 Como Verificar se Funcionou

### 1. No Banco de Dados
```sql
-- Verificar dados na tabela pontuacoes
SELECT * FROM public.pontuacoes 
WHERE pontuacao_total > 0;

-- Verificar dados detalhados (se usou bypass_trigger_test.sql)
SELECT * FROM public.desafios_diarios 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY data;
```

### 2. No Dashboard
1. Navegue para página de Perfil
2. Veja o gráfico com **7 dias sempre visíveis**
3. Estatísticas mostram dias completados vs total
4. Tooltip mostra detalhes ao passar mouse

### 3. Logs de Debug
1. Abra DevTools (F12) → Console
2. Procure por logs:
   - 🔍 Carregando dados para usuário
   - 📊 Dados desafios_diarios
   - 💰 Dados pontuacoes
   - 📈 Dados finais do gráfico

## 🎨 Resultado Esperado

### Com `test_dashboard_simple.sql`
```
Dashboard mostra:
Dia 1: ~485 pontos | Dia 2: ~485 pontos | ... | Dia 7: ~490 pontos
Estatísticas: 3400 pontos total, 7/7 dias, média 485
```

### Com `bypass_trigger_test.sql`
```
Dashboard mostra:
Dia 1: 500 pontos | Dia 2: 0 pontos | Dia 3: 800 pontos | Dia 4: 0 pontos | 
Dia 5: 1200 pontos | Dia 6: 0 pontos | Dia 7: 900 pontos
Estatísticas: 3400 pontos total, 4/7 dias, média 850
```

## 🚀 Próximos Passos

1. **Execute `test_dashboard_simple.sql`** primeiro
2. **Teste o dashboard** na página de Perfil
3. **Verifique os logs** no console do navegador
4. **Se quiser dados mais realistas**, use `bypass_trigger_test.sql` (com permissões admin)

## ⚠️ Notas Importantes

- **Triggers de validação**: Existem para proteger a integridade dos dados
- **Scripts de teste**: Apenas para desenvolvimento/debug
- **Produção**: Usuários reais devem seguir o fluxo normal do desafio
- **Permissões**: Alguns scripts requerem privilégios administrativos

## 🎯 Objetivo Final

Demonstrar que o dashboard agora **sempre mostra 7 dias** no eixo X, com:
- ✅ Dias com dados: pontuação real
- ✅ Dias vazios: 0 pontos
- ✅ Estatísticas corretas: X/7 dias completados
- ✅ Tooltip informativo para todos os dias