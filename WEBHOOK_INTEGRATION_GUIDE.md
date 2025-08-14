# Guia de Integração com Webhook

Este guia explica como foi implementada a integração com webhook para enviar dados de novos usuários para o n8n.

## 📋 Resumo

Quando um usuário cria uma conta na aplicação, os dados são automaticamente enviados para o webhook configurado: `https://n8n.guidonutri.com/webhook/2f60b388-e1a4-4703-b6ea-e85ea8f0511b`

## 🔧 Como Funciona

### 1. Processo de Criação de Usuário

1. **Frontend**: Usuário preenche o formulário de cadastro em `src/pages/Login.tsx`
2. **Auth Hook**: A função `signUp` em `src/hooks/use-auth.tsx` é chamada
3. **Supabase Auth**: Cria o usuário no sistema de autenticação
4. **Database Trigger**: A função `handle_new_user()` é executada automaticamente
5. **Webhook**: Os dados do usuário são enviados para o n8n

### 2. Dados Enviados no Webhook

```json
{
  "user_id": "uuid-do-usuario",
  "email": "usuario@email.com",
  "nome": "Nome do Usuário",
  "peso_inicial": 75.5,
  "created_at": "2025-02-04T10:30:00Z",
  "challenge_start_date": "2025-02-04T10:30:00Z",
  "event_type": "user_created"
}
```

### 3. Funções Criadas

#### `send_user_webhook(user_data jsonb)`
- Envia dados para o webhook via HTTP POST
- Usa a extensão `http` do PostgreSQL
- Não bloqueia a criação do usuário se falhar
- Registra logs de sucesso/erro

#### `handle_new_user()` (atualizada)
- Cria perfil do usuário
- Cria registro de pontuações
- Prepara dados do webhook
- Chama a função de envio do webhook

## 🚀 Como Aplicar

### Opção 1: Via Supabase CLI
```bash
supabase db push
```

### Opção 2: Via SQL direto
```bash
psql -h your-db-host -U postgres -d your-database -f apply_webhook_migration.sql
```

### Opção 3: Via Dashboard do Supabase
1. Acesse o SQL Editor no dashboard
2. Cole o conteúdo de `apply_webhook_migration.sql`
3. Execute o script

## 🧪 Como Testar

### 1. Teste Automático
```bash
node test_webhook_integration.js
```

### 2. Teste Manual
1. Crie uma nova conta na aplicação
2. Verifique os logs do n8n para confirmar o recebimento
3. Verifique os logs do Supabase para confirmar o envio

### 3. Teste da Função Diretamente
```sql
SELECT public.send_user_webhook('{
  "user_id": "test-123",
  "email": "test@example.com",
  "nome": "Teste",
  "peso_inicial": 70.0,
  "created_at": "2025-02-04T10:30:00Z",
  "challenge_start_date": "2025-02-04T10:30:00Z",
  "event_type": "user_created_test"
}'::jsonb);
```

## 🔍 Monitoramento

### Logs do Supabase
- Acesse o dashboard do Supabase
- Vá para "Logs" > "Database"
- Procure por mensagens de webhook

### Logs do n8n
- Verifique o workflow no n8n
- Monitore execuções do webhook
- Confirme recebimento dos dados

## ⚠️ Considerações Importantes

### Segurança
- A função usa `SECURITY DEFINER` para executar com privilégios elevados
- O webhook é chamado de forma assíncrona para não bloquear a criação do usuário
- Erros no webhook não impedem a criação da conta

### Performance
- O envio do webhook é não-bloqueante
- Se o webhook falhar, o usuário ainda é criado normalmente
- Logs são registrados para debugging

### Manutenção
- URL do webhook está hardcoded na função
- Para alterar, execute uma nova migração
- Monitore regularmente os logs de erro

## 🔄 Alterando o Webhook

Para alterar a URL do webhook, execute:

```sql
CREATE OR REPLACE FUNCTION public.send_user_webhook(user_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text := 'NOVA_URL_AQUI';
  response http_response;
BEGIN
  SELECT * INTO response
  FROM http_post(
    webhook_url,
    user_data::text,
    'application/json'
  );
  
  RAISE NOTICE 'Webhook response: status=%, content=%', response.status, response.content;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send webhook: %', SQLERRM;
END;
$$;
```

## 📊 Status da Implementação

- ✅ Migração criada
- ✅ Função de webhook implementada
- ✅ Trigger atualizado
- ✅ Script de teste criado
- ✅ Documentação completa

A integração está pronta para uso! 🎉