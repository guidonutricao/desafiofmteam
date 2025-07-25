# Design Document

## Overview

Este documento detalha o design da implementação para a lógica de contagem de dias do desafio baseada no horário de Brasília. O sistema utilizará a biblioteca `date-fns-tz` para manipulação precisa de timezones e implementará funções utilitárias centralizadas para garantir consistência em toda a aplicação.

## Architecture

### Timezone Management Strategy
- **Timezone padrão**: `America/Sao_Paulo` (UTC-3, com ajuste automático para horário de verão)
- **Biblioteca**: `date-fns-tz` para manipulação de timezone
- **Armazenamento**: Datas no banco em UTC, conversão para Brasília na aplicação
- **Cálculos**: Todos os cálculos de dias baseados em horário de Brasília

### Data Flow
```
1. Usuário se inscreve → Data armazenada em UTC
2. Sistema consulta data → Converte para America/Sao_Paulo
3. Calcula dia do desafio → Baseado em dias completos em Brasília
4. Exibe progresso → "Dia X/7" baseado no cálculo
```

## Components and Interfaces

### 1. Timezone Utilities (`src/lib/timezoneUtils.ts`)

```typescript
// Constantes
export const BRASILIA_TIMEZONE = 'America/Sao_Paulo';
export const CHALLENGE_DURATION_DAYS = 7;

// Função para obter data atual em Brasília
export function getCurrentBrasiliaDate(): Date;

// Função para converter qualquer data para Brasília
export function toBrasiliaDate(date: Date): Date;

// Função para obter início do dia em Brasília
export function getStartOfDayBrasilia(date: Date): Date;

// Função para calcular dias decorridos desde uma data
export function calculateDaysSinceStart(startDate: Date): number;

// Função para determinar o dia atual do desafio (1-7)
export function getChallengeDay(userStartDate: Date): number;

// Função para verificar se o desafio foi concluído
export function isChallengeCompleted(userStartDate: Date): boolean;

// Função para verificar se o desafio ainda não começou
export function isChallengeNotStarted(userStartDate: Date): boolean;

// Função para formatar data em português brasileiro
export function formatBrasiliaDate(date: Date, format: string): string;
```

### 2. Challenge Progress Hook (`src/hooks/useChallengeProgress.ts`)

```typescript
interface ChallengeProgress {
  currentDay: number;
  totalDays: number;
  isCompleted: boolean;
  isNotStarted: boolean;
  daysRemaining: number;
  progressPercentage: number;
  displayText: string;
}

export function useChallengeProgress(userStartDate: Date): ChallengeProgress;
```

### 3. Database Schema Updates

#### User Challenge Tracking
```sql
-- Adicionar campos para rastreamento do desafio
ALTER TABLE profiles ADD COLUMN challenge_start_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN challenge_completed_at TIMESTAMPTZ;

-- Índices para performance
CREATE INDEX idx_profiles_challenge_start ON profiles(challenge_start_date);
CREATE INDEX idx_profiles_challenge_completed ON profiles(challenge_completed_at);
```

#### Daily Progress Tracking
```sql
-- Tabela para rastrear progresso diário
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_day INTEGER NOT NULL, -- 1 to 7
  date DATE NOT NULL, -- Data em UTC, convertida na aplicação
  tasks_completed JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_day)
);

CREATE INDEX idx_daily_progress_user_day ON daily_progress(user_id, challenge_day);
CREATE INDEX idx_daily_progress_date ON daily_progress(date);
```

### 4. Component Updates

#### Daily Challenge Page (`src/pages/DesafioDiario.tsx`)

```typescript
// Atualização do componente para usar o novo hook
function DesafioDiario() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const challengeProgress = useChallengeProgress(profile?.challenge_start_date);
  
  return (
    <div>
      <h1>{challengeProgress.displayText}</h1>
      {/* Resto do componente */}
    </div>
  );
}
```

#### Ranking Page (`src/pages/Ranking.tsx`)

```typescript
// Interface para dados do ranking
interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  challengeStartDate: Date;
  challengeProgress: ChallengeProgress;
}

// Componente atualizado
function Ranking() {
  const { data: rankingData } = useRankingData();
  
  return (
    <div>
      {rankingData?.map(user => (
        <RankingCard 
          key={user.id}
          user={user}
          challengeDay={user.challengeProgress.displayText}
        />
      ))}
    </div>
  );
}
```

### 5. API Integration

#### Supabase Functions

```typescript
// src/lib/supabase/challengeQueries.ts

// Função para iniciar desafio
export async function startChallenge(userId: string): Promise<void> {
  const startDate = getCurrentBrasiliaDate();
  
  await supabase
    .from('profiles')
    .update({ 
      challenge_start_date: startDate.toISOString(),
      challenge_completed_at: null 
    })
    .eq('id', userId);
}

// Função para obter progresso do usuário
export async function getUserChallengeProgress(userId: string): Promise<ChallengeProgress | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('challenge_start_date, challenge_completed_at')
    .eq('id', userId)
    .single();
    
  if (!profile?.challenge_start_date) return null;
  
  return useChallengeProgress(new Date(profile.challenge_start_date));
}

// Função para obter dados do ranking
export async function getRankingData(): Promise<RankingUser[]> {
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      avatar,
      challenge_start_date,
      challenge_completed_at,
      daily_progress(points_earned)
    `)
    .not('challenge_start_date', 'is', null);
    
  return users?.map(user => ({
    ...user,
    totalPoints: user.daily_progress.reduce((sum, day) => sum + day.points_earned, 0),
    challengeProgress: useChallengeProgress(new Date(user.challenge_start_date))
  })) || [];
}
```

## Data Models

### Updated User Profile
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  weight: number;
  height: number;
  goal: 'lose' | 'maintain' | 'gain';
  challenge_start_date?: Date; // Nova propriedade
  challenge_completed_at?: Date; // Nova propriedade
  created_at: Date;
  updated_at: Date;
}
```

### Daily Progress Model
```typescript
interface DailyProgress {
  id: string;
  user_id: string;
  challenge_day: number; // 1-7
  date: Date;
  tasks_completed: {
    hydration: boolean;
    sleep: boolean;
    workout: boolean;
    diet: boolean;
    photo: boolean;
  };
  points_earned: number;
  created_at: Date;
  updated_at: Date;
}
```

### Challenge Progress Model
```typescript
interface ChallengeProgress {
  currentDay: number; // 1-7, ou 0 se não iniciado, 8+ se concluído
  totalDays: number; // Sempre 7
  isCompleted: boolean;
  isNotStarted: boolean;
  daysRemaining: number;
  progressPercentage: number; // 0-100
  displayText: string; // "Dia 3/7", "Concluído", "Inicia amanhã"
}
```

## Error Handling

### Timezone Conversion Errors
```typescript
// Wrapper com tratamento de erro
export function safeGetChallengeDay(userStartDate: Date | null): number {
  try {
    if (!userStartDate) return 0;
    return getChallengeDay(userStartDate);
  } catch (error) {
    console.error('Error calculating challenge day:', error);
    return 0;
  }
}
```

### Database Query Errors
```typescript
// Hook com tratamento de erro
export function useChallengeProgress(userStartDate: Date | null) {
  return useMemo(() => {
    try {
      if (!userStartDate) {
        return {
          currentDay: 0,
          totalDays: 7,
          isCompleted: false,
          isNotStarted: true,
          daysRemaining: 7,
          progressPercentage: 0,
          displayText: 'Desafio não iniciado'
        };
      }
      
      const currentDay = getChallengeDay(userStartDate);
      const isCompleted = isChallengeCompleted(userStartDate);
      
      return {
        currentDay: Math.min(currentDay, 7),
        totalDays: 7,
        isCompleted,
        isNotStarted: false,
        daysRemaining: Math.max(0, 7 - currentDay),
        progressPercentage: Math.min((currentDay / 7) * 100, 100),
        displayText: isCompleted 
          ? 'Desafio Shape Express - Concluído'
          : `Desafio Shape Express - Dia ${currentDay}/7`
      };
    } catch (error) {
      console.error('Error in useChallengeProgress:', error);
      return {
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Erro ao calcular progresso'
      };
    }
  }, [userStartDate]);
}
```

## Testing Strategy

### Unit Tests for Timezone Utils
```typescript
// src/lib/__tests__/timezoneUtils.test.ts
describe('timezoneUtils', () => {
  test('getCurrentBrasiliaDate returns correct timezone', () => {
    const brasiliaDate = getCurrentBrasiliaDate();
    expect(brasiliaDate.getTimezoneOffset()).toBe(180); // UTC-3
  });
  
  test('getChallengeDay calculates correctly', () => {
    const startDate = new Date('2024-01-01T00:00:00-03:00');
    const currentDate = new Date('2024-01-03T12:00:00-03:00');
    
    // Mock current date
    jest.useFakeTimers().setSystemTime(currentDate);
    
    expect(getChallengeDay(startDate)).toBe(3);
  });
  
  test('handles timezone edge cases', () => {
    // Test midnight transitions
    // Test daylight saving time changes
    // Test different input timezones
  });
});
```

### Integration Tests
```typescript
// src/hooks/__tests__/useChallengeProgress.test.ts
describe('useChallengeProgress', () => {
  test('returns correct progress for day 3', () => {
    const startDate = new Date('2024-01-01T00:00:00-03:00');
    const { result } = renderHook(() => useChallengeProgress(startDate));
    
    expect(result.current.currentDay).toBe(3);
    expect(result.current.displayText).toBe('Desafio Shape Express - Dia 3/7');
    expect(result.current.progressPercentage).toBe(42.86);
  });
});
```

## Performance Considerations

### Caching Strategy
```typescript
// Cache para cálculos de timezone
const challengeProgressCache = new Map<string, ChallengeProgress>();

export function getCachedChallengeProgress(
  userId: string, 
  startDate: Date
): ChallengeProgress {
  const cacheKey = `${userId}-${startDate.toISOString()}`;
  
  if (challengeProgressCache.has(cacheKey)) {
    return challengeProgressCache.get(cacheKey)!;
  }
  
  const progress = calculateChallengeProgress(startDate);
  challengeProgressCache.set(cacheKey, progress);
  
  // Clear cache after 1 hour
  setTimeout(() => {
    challengeProgressCache.delete(cacheKey);
  }, 3600000);
  
  return progress;
}
```

### Database Optimization
```sql
-- Índices para queries frequentes
CREATE INDEX idx_profiles_challenge_active 
ON profiles(challenge_start_date) 
WHERE challenge_start_date IS NOT NULL 
AND challenge_completed_at IS NULL;

-- View materializada para ranking (opcional)
CREATE MATERIALIZED VIEW ranking_view AS
SELECT 
  p.id,
  p.name,
  p.avatar,
  p.challenge_start_date,
  COALESCE(SUM(dp.points_earned), 0) as total_points
FROM profiles p
LEFT JOIN daily_progress dp ON p.id = dp.user_id
WHERE p.challenge_start_date IS NOT NULL
GROUP BY p.id, p.name, p.avatar, p.challenge_start_date
ORDER BY total_points DESC;

-- Refresh automático da view (se necessário)
CREATE OR REPLACE FUNCTION refresh_ranking_view()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW ranking_view;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Migration Strategy

### Phase 1: Database Updates
1. Adicionar colunas `challenge_start_date` e `challenge_completed_at`
2. Criar tabela `daily_progress`
3. Migrar dados existentes (se houver)

### Phase 2: Utility Functions
1. Implementar `timezoneUtils.ts`
2. Criar testes unitários
3. Implementar `useChallengeProgress` hook

### Phase 3: Component Updates
1. Atualizar página de desafio diário
2. Atualizar página de ranking
3. Atualizar queries do Supabase

### Phase 4: Testing & Validation
1. Testes de integração
2. Validação com dados reais
3. Monitoramento de performance