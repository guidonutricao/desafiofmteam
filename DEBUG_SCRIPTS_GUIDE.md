# Guia dos Scripts de Debug do Dashboard

## 🚀 Scripts Disponíveis

### 1. `quick_dashboard_test.sql` ⚡
**Use este primeiro!** Script mais simples para verificar rapidamente se há dados.

```sql
-- Mostra quantos registros existem em cada tabela
-- Lista usuários com pontuação
-- Sem erros de SQL complexo
```

### 2. `simple_debug_dashboard.sql` 🔍
Script intermediário com mais detalhes, mas ainda simples.

```sql
-- Estatísticas por tabela
-- Usuários com dados detalhados vs apenas pontuação total
-- Últimos registros criados
```

### 3. `check_desafios_data.sql` 📊
Script mais completo para análise detalhada.

```sql
-- Comparações entre tabelas
-- Estatísticas avançadas
-- Dados por usuário
```

### 4. `debug_dashboard_data.sql` 🛠️
Script mais técnico para debug profundo (corrigido).

## 🎯 Como Usar

### Passo 1: Verificação Rápida
```sql
-- Execute primeiro:
\i quick_dashboard_test.sql
```

### Passo 2: Se Não Há Dados
Se o resultado mostrar 0 registros, você precisa:
1. Ir para a página "Desafio Diário"
2. Completar algumas tarefas
3. Ou executar o script de dados de teste:
```sql
\i insert_progress_test_data.sql
```

### Passo 3: Debug Específico
Se há dados mas o dashboard não mostra, use seu user_id:

```sql
-- Substitua 'seu-user-id-aqui' pelo seu ID real
SELECT 
    data,
    pontuacao_total,
    hidratacao,
    sono_qualidade,
    atividade_fisica,
    seguiu_dieta,
    registro_visual
FROM public.desafios_diarios 
WHERE user_id = 'seu-user-id-aqui'
ORDER BY data ASC;
```

## 🔧 Troubleshooting

### Problema: "Nenhum progresso registrado"
**Soluções:**
1. Execute `quick_dashboard_test.sql`
2. Se não há dados, complete tarefas no Desafio Diário
3. Se há dados, verifique os logs no console do navegador (F12)

### Problema: Erro SQL
**Soluções:**
1. Use `quick_dashboard_test.sql` (mais simples)
2. Verifique se as tabelas existem
3. Confirme permissões de acesso

### Problema: Dashboard vazio mas há pontuação
**Soluções:**
1. Abra DevTools (F12) → Console
2. Navegue para a página de Perfil
3. Veja os logs que começam com 🔍, 📊, 💰
4. Copie seu user_id dos logs
5. Execute query específica com seu user_id

## 📝 Exemplo de Uso Completo

```sql
-- 1. Verificação inicial
SELECT 
    (SELECT COUNT(*) FROM public.desafios_diarios WHERE pontuacao_total > 0) as tem_desafios,
    (SELECT COUNT(*) FROM public.pontuacoes WHERE pontuacao_total > 0) as tem_pontuacoes;

-- 2. Se tem_desafios > 0, ver quais usuários:
SELECT p.nome, COUNT(*) as dias, SUM(dd.pontuacao_total) as pontos
FROM public.profiles p
JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE dd.pontuacao_total > 0
GROUP BY p.user_id, p.nome
ORDER BY pontos DESC;

-- 3. Se tem_pontuacoes > 0 mas tem_desafios = 0:
SELECT p.nome, pt.pontuacao_total
FROM public.profiles p
JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE pt.pontuacao_total > 0
ORDER BY pt.pontuacao_total DESC;
```

## ✅ Resultado Esperado

Após executar os scripts, você deve ver:
- **Dados encontrados**: Lista de usuários com pontuação
- **Sem dados**: Instruções para completar tarefas
- **Erro**: Verificar permissões ou estrutura do banco

## 🎯 Próximos Passos

1. Execute `quick_dashboard_test.sql`
2. Se há dados mas dashboard não funciona, abra DevTools
3. Se não há dados, complete tarefas no Desafio Diário
4. Para dados de teste, execute `insert_progress_test_data.sql`