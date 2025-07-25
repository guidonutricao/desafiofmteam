# Requirements Document

## Introduction

Este documento define os requisitos para implementar a lógica de contagem de dias do desafio baseada no horário de Brasília (UTC-3). O sistema deve permitir que cada participante tenha sua própria linha do tempo de 7 dias, iniciando no dia seguinte à sua inscrição, com contagem precisa baseada no timezone `America/Sao_Paulo`.

## Requirements

### Requirement 1

**User Story:** Como participante do desafio, eu quero que minha contagem de dias seja baseada no horário de Brasília, para que eu tenha uma experiência consistente independente do meu timezone local.

#### Acceptance Criteria

1. WHEN o sistema calcula o dia atual do desafio THEN o sistema SHALL usar o timezone `America/Sao_Paulo` (UTC-3)
2. WHEN um usuário se inscreve no desafio THEN o sistema SHALL registrar a data de inscrição em horário de Brasília
3. WHEN o sistema determina o início do desafio THEN o sistema SHALL começar a contagem no dia seguinte à inscrição (00:00 horário de Brasília)
4. WHEN o sistema calcula dias decorridos THEN o sistema SHALL considerar apenas dias completos em horário de Brasília
5. WHEN é meia-noite em Brasília THEN o sistema SHALL avançar automaticamente para o próximo dia do desafio

### Requirement 2

**User Story:** Como participante, eu quero ver meu progresso individual na página de desafios diários, para que eu saiba exatamente em que dia do meu desafio pessoal estou.

#### Acceptance Criteria

1. WHEN acesso a página `#desafiosdiarios` THEN o sistema SHALL exibir "Desafio Shape Express - Dia X/7" onde X é meu dia atual
2. WHEN estou no primeiro dia do desafio THEN o sistema SHALL exibir "Desafio Shape Express - Dia 1/7"
3. WHEN estou no último dia do desafio THEN o sistema SHALL exibir "Desafio Shape Express - Dia 7/7"
4. WHEN o desafio terminou THEN o sistema SHALL exibir "Desafio Shape Express - Concluído"
5. WHEN ainda não começou meu desafio THEN o sistema SHALL exibir "Desafio Shape Express - Inicia amanhã"

### Requirement 3

**User Story:** Como participante, eu quero ver meu progresso no ranking, para que eu possa acompanhar minha pontuação e dia atual em relação aos outros participantes.

#### Acceptance Criteria

1. WHEN acesso a página `#ranking` THEN o sistema SHALL exibir minha pontuação atual acumulada
2. WHEN visualizo meu perfil no ranking THEN o sistema SHALL mostrar "Dia X/7" baseado no meu progresso individual
3. WHEN outros participantes estão em dias diferentes THEN o sistema SHALL exibir o dia correto para cada um
4. WHEN um participante completou o desafio THEN o sistema SHALL exibir "Concluído" em vez de "Dia X/7"
5. WHEN um participante ainda não começou THEN o sistema SHALL exibir "Não iniciado" ou similar

### Requirement 4

**User Story:** Como sistema, eu preciso gerenciar múltiplos usuários com datas de início diferentes, para que cada participante tenha sua própria jornada de 7 dias.

#### Acceptance Criteria

1. WHEN múltiplos usuários se inscrevem em dias diferentes THEN o sistema SHALL manter cronogramas independentes para cada um
2. WHEN calculo o dia do desafio para um usuário THEN o sistema SHALL usar apenas a data de inscrição desse usuário específico
3. WHEN um usuário A está no dia 3 e usuário B no dia 1 THEN o sistema SHALL exibir corretamente o progresso individual de cada um
4. WHEN um usuário completa 7 dias THEN o sistema SHALL marcar seu desafio como concluído independente dos outros
5. WHEN consulto dados de múltiplos usuários THEN o sistema SHALL calcular corretamente o dia de cada um em paralelo

### Requirement 5

**User Story:** Como sistema, eu preciso manter a persistência de pontuação desacoplada da mudança de dias, para que a pontuação continue acumulando mesmo quando o dia muda.

#### Acceptance Criteria

1. WHEN o dia muda de 1 para 2 THEN o sistema SHALL manter toda a pontuação acumulada do dia anterior
2. WHEN um usuário ganha pontos no dia 3 THEN o sistema SHALL somar aos pontos dos dias 1 e 2
3. WHEN o sistema reinicia tarefas diárias THEN o sistema SHALL manter a pontuação total intacta
4. WHEN consulto a pontuação de um usuário THEN o sistema SHALL retornar a soma de todos os dias completados
5. WHEN um usuário completa o desafio THEN o sistema SHALL preservar toda a pontuação acumulada dos 7 dias

### Requirement 6

**User Story:** Como desenvolvedor, eu preciso de funções utilitárias para cálculos de timezone, para que eu possa implementar a lógica de forma consistente em toda a aplicação.

#### Acceptance Criteria

1. WHEN preciso da data atual em Brasília THEN o sistema SHALL fornecer função `getCurrentBrasiliaDate()`
2. WHEN preciso calcular dias decorridos THEN o sistema SHALL fornecer função `calculateDaysSinceStart(startDate)`
3. WHEN preciso determinar o dia do desafio THEN o sistema SHALL fornecer função `getChallengeDay(userStartDate)`
4. WHEN preciso verificar se o desafio terminou THEN o sistema SHALL fornecer função `isChallengeCompleted(userStartDate)`
5. WHEN preciso formatar datas THEN o sistema SHALL usar formatação consistente em horário de Brasília