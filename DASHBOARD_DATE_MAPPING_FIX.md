# Correção do Mapeamento de Datas no Dashboard

## 🐛 Problema Identificado

O dashboard de progresso estava plotando os dados de forma incorreta, associando a pontuação diária ao dia errado do desafio. Exemplos observados:
- Usuário no dia 4 do desafio aparecia com pontuação no dia 5
- Outro usuário no dia 4 aparecia com pontuação no dia 3

## 🔍 Causa Raiz

O problema estava na função `createFullWeekData` que mapeava os dados por **índice** em vez de usar a **data real** do registro:

```javascript
// ❌ CÓDIGO INCORRETO (antes da correção)
const transformedData = desafiosData.map((item, index) => ({
  day: index + 1, // Mapeamento por índice - INCORRETO!
  points: item.pontuacao_total || 0,
  date: item.data,
  // ...
}));
```

## ✅ Solução Implementada

### 1. Mapeamento Baseado em Data Real

Agora o dashboard calcula corretamente qual dia do desafio cada registro representa:

```javascript
// ✅ CÓDIGO CORRETO (após a correção)
const dayData = dataPoints.find(item => {
  if (challengeStartDate && item.data) {
    // Calcular qual dia do desafio esta data representa
    const itemDate = new Date(item.data);
    const startDate = new Date(challengeStartDate);
    const diffTime = itemDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === day; // Mapear pela data real!
  }
  return dataPoints.indexOf(item) + 1 === day; // Fallback
});
```

### 2. Uso da `challenge_start_date`

O dashboard agora:
- Busca a `challenge_start_date` do perfil do usuário
- Usa essa data como referência para calcular os dias do desafio
- Mapeia cada registro para o dia correto baseado na diferença de datas

### 3. Estrutura de Dados Corrigida

```javascript
// Para cada dia do desafio (1-7)
for (let day = 1; day <= 7; day++) {
  // Calcular a data esperada para este dia
  if (challengeStartDate) {
    const dayDate = new Date(challengeStartDate);
    dayDate.setDate(dayDate.getDate() + (day - 1));
    expectedDate = dayDate.toISOString().split('T')[0];
  }
  
  // Encontrar dados que correspondem a este dia específico
  const dayData = dataPoints.find(item => {
    const itemDate = new Date(item.data);
    const startDate = new Date(challengeStartDate);
    const diffTime = itemDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === day;
  });
}
```

## 🧪 Como Testar a Correção

### 1. Execute o Script de Teste
```sql
-- Script completo (corrigido)
\i test_dashboard_date_mapping.sql

-- OU script simplificado (recomendado)
\i quick_test_dashboard_fix.sql
```

**Nota**: O script original tinha um erro SQL com `EXTRACT()`. Foi corrigido para usar subtração direta de datas.

### 2. Verificar no Dashboard
1. Acesse a página de Perfil
2. Verifique se o dashboard mostra os dados nos dias corretos
3. Compare com os dados reais no banco usando o script de teste

### 3. Logs de Debug
O dashboard agora inclui logs mais detalhados:
```javascript
console.log('📅 Data de início do desafio:', challengeStartDate);
console.log('📅 Dia atual do desafio:', currentDay);
console.log('📊 Dados desafios_diarios:', desafiosData);
```

## 📊 Cenários Cobertos

### Usuários com `challenge_start_date`
- ✅ Mapeamento preciso baseado na data de início
- ✅ Cada registro é associado ao dia correto do desafio
- ✅ Registros fora do período de 7 dias são ignorados

### Usuários sem `challenge_start_date` (Fallback)
- ✅ Usa o comportamento anterior (mapeamento por índice)
- ✅ Funciona até que a migração seja aplicada
- ✅ Dados simulados respeitam as datas quando possível

### Dados Simulados (Tabela `pontuacoes`)
- ✅ Distribuição baseada na `challenge_start_date` quando disponível
- ✅ Fallback para datas recentes quando não há data de início
- ✅ Mantém a variação natural de pontos por dia

## 🔧 Arquivos Modificados

1. **`src/components/ProgressDashboard.tsx`**
   - Função `createFullWeekData` corrigida
   - Adicionada função `getChallengeStartDate`
   - Melhorado cálculo do dia atual do desafio
   - Logs de debug aprimorados

2. **`test_dashboard_date_mapping.sql`** (novo)
   - Script para testar o mapeamento correto
   - Verificação de usuários com/sem `challenge_start_date`
   - Identificação de registros fora do período

## 🎯 Resultado Esperado

Após a correção:
- ✅ Usuário no dia 4 do desafio vê sua pontuação no dia 4 do gráfico
- ✅ Dados são mapeados pela data real, não por índice
- ✅ Dashboard reflete o progresso temporal correto
- ✅ Compatibilidade mantida com usuários antigos

## 🚀 Próximos Passos

1. **Testar em produção** com usuários reais
2. **Aplicar migração** para usuários sem `challenge_start_date`
3. **Remover logs de debug** após confirmação
4. **Monitorar** se há outros casos edge

## 📝 Notas Técnicas

- A correção é **retrocompatível** - não quebra usuários existentes
- Funciona tanto com dados reais quanto simulados
- Mantém a estrutura de 7 dias sempre visível no gráfico
- Preserva todas as funcionalidades existentes do dashboard