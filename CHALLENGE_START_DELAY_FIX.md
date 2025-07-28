# Correção do Delay de Início dos Desafios

## Problema Identificado

Anteriormente, quando um novo usuário se registrava no sistema, ele conseguia marcar tarefas como concluídas no mesmo dia do registro, fazendo com que seu status no ranking mudasse imediatamente de "não iniciado" para "participando".

## Comportamento Esperado

1. **Delay de 1 dia**: O desafio deve iniciar apenas no dia seguinte à data de registro
2. **Visualização sem ação**: Usuários podem ver as tarefas no mesmo dia, mas não podem marcá-las como concluídas
3. **Popup informativo**: Ao tentar marcar uma tarefa, mostrar mensagem explicativa
4. **Status correto no ranking**: Usuários devem permanecer como "não iniciado" até o primeiro dia oficial
5. **Timezone de Brasília**: Toda lógica baseada no horário de Brasília (`America/Sao_Paulo`)

## Implementação

### 1. Backend (Supabase)

#### Nova Migração: `20250128000000_fix_challenge_start_delay.sql`

**Funções Criadas:**

- `can_user_complete_tasks(user_id)`: Verifica se usuário pode completar tarefas
- `get_user_challenge_status(user_id)`: Retorna status completo do desafio
- `check_challenge_start_before_task_completion()`: Função de trigger para bloquear tarefas

**Triggers Adicionados:**

- `check_challenge_start_before_insert`: Bloqueia inserção de tarefas concluídas
- `check_challenge_start_before_update`: Bloqueia atualização para tarefas concluídas

**Lógica de Validação:**

```sql
-- Usuário pode completar tarefas apenas se:
current_brasilia_date > start_brasilia_date

-- Onde:
-- current_brasilia_date = data atual em Brasília
-- start_brasilia_date = data de registro em Brasília
```

### 2. Frontend (React/TypeScript)

#### Novos Hooks:

**`useChallengeStatus.ts`**
- Gerencia estado completo do desafio
- Verifica se usuário pode completar tarefas
- Integra com nova função RPC do Supabase

#### Novos Componentes:

**`ChallengeStartDialog.tsx`**
- Popup informativo para usuários que tentam marcar tarefas cedo demais
- Explica quando o desafio começará oficialmente
- Design amigável com informações claras

#### Atualizações em Componentes Existentes:

**`DesafioDiario.tsx`**
- Integração com `useChallengeStatus`
- Verificação antes de permitir marcação de tarefas
- Exibição do popup quando necessário
- Tratamento de erros específicos do backend

**`Ranking.tsx`**
- Status mais preciso para usuários ("Inicia amanhã", "Dia X/7")
- Melhor diferenciação entre estados do desafio

### 3. Fluxo de Funcionamento

#### Dia do Registro (Dia 0):
1. Usuário se registra e `challenge_start_date` é definido
2. `can_complete_tasks` retorna `false`
3. Usuário vê tarefas mas não pode marcá-las
4. Tentativa de marcação mostra popup informativo
5. Status no ranking: "Inicia amanhã"

#### Primeiro Dia Oficial (Dia 1):
1. `can_complete_tasks` retorna `true`
2. Usuário pode marcar tarefas normalmente
3. Status no ranking: "Dia 1/7"
4. Pontuação começa a ser contabilizada

#### Dias Subsequentes (Dias 2-7):
1. Funcionamento normal do desafio
2. Status no ranking: "Dia X/7"

#### Após 7 Dias:
1. Desafio marcado como concluído
2. Status no ranking: "Concluído"

### 4. Tratamento de Timezone

Toda a lógica utiliza o timezone de Brasília (`America/Sao_Paulo`):

- Conversão de datas no backend via `AT TIME ZONE 'America/Sao_Paulo'`
- Comparação apenas da parte da data (sem horário)
- Consistência entre registro e verificação de tarefas

### 5. Tratamento de Erros

#### Backend:
- Erro `CHALLENGE_NOT_STARTED` quando usuário tenta marcar tarefas cedo demais
- Mensagens descritivas com `DETAIL` e `HINT`

#### Frontend:
- Captura específica do erro `CHALLENGE_NOT_STARTED`
- Exibição do popup informativo
- Reversão do estado da tarefa em caso de erro

### 6. Testes

Arquivo `test_challenge_start_delay.js` para validar:
- Criação das funções no banco
- Comportamento correto para usuário recém-registrado
- Bloqueio de tarefas no mesmo dia
- Status correto do desafio

### 7. Compatibilidade

A implementação mantém compatibilidade com:
- Sistema de pontuação existente
- Estrutura de dados atual
- Usuários que já iniciaram desafios
- Sistema de ranking

### 8. Benefícios

1. **Experiência mais justa**: Todos os usuários têm o mesmo tempo para completar tarefas
2. **Clareza de expectativas**: Usuários sabem exatamente quando podem começar
3. **Consistência de dados**: Elimina inconsistências no ranking
4. **Melhor UX**: Feedback claro sobre quando o desafio começará

## Como Testar

1. Execute a migração no Supabase
2. Registre um novo usuário
3. Tente marcar uma tarefa no mesmo dia
4. Verifique se o popup aparece
5. Aguarde até o dia seguinte e teste novamente
6. Execute o script de teste automatizado

## Rollback

Se necessário fazer rollback:

1. Remover triggers da tabela `desafios_diarios`
2. Remover funções criadas
3. Reverter código do frontend para versão anterior

A estrutura de dados permanece intacta, facilitando o rollback se necessário.