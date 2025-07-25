# Points Persistence System

This document explains the implementation of the points persistence logic for the 7-day challenge system.

## Overview

The points persistence system ensures that:
1. Points accumulate across all challenge days without reset
2. Daily task resets are decoupled from points persistence
3. Users maintain their total points even when tasks are reset
4. Points can be calculated cumulatively across all challenge days

## Key Functions

### Core Points Functions

#### `calculateTotalChallengePoints(userId: string): Promise<number>`
- Calculates the total points earned by a user across all challenge days
- Sums up points from all entries in the `daily_progress` table
- Returns 0 if no progress is found

#### `updateDailyProgress(userId, challengeDay, tasksCompleted, pointsEarned)`
- Updates daily progress while preserving existing points
- If progress already exists for the day, it preserves the existing points
- Only updates the `tasks_completed` field, keeping `points_earned` intact

#### `resetDailyTasks(userId, challengeDay)`
- Resets all tasks for a specific challenge day to incomplete
- **Preserves all points earned** for that day
- Demonstrates decoupling of task state from points persistence

#### `addPointsToDay(userId, challengeDay, additionalPoints)`
- Adds points to an existing challenge day
- Preserves the current task completion state
- Accumulates points without affecting task progress

### Points Breakdown and Analysis

#### `getChallengePointsBreakdown(userId): Promise<Array>`
- Returns detailed breakdown of points by challenge day
- Includes points earned, tasks completed, and date for each day
- Useful for analytics and progress tracking

#### `getCombinedUserPoints(userId): Promise<Object>`
- Combines points from both legacy system (`pontuacoes` table) and new challenge system
- Returns breakdown of legacy points, challenge points, and total
- Ensures backward compatibility with existing point systems

### Legacy System Integration

#### `syncChallengePointsWithLegacy(userId)`
- Syncs challenge points with the legacy `pontuacoes` table
- Maintains compatibility with existing ranking and points display
- Updates `ultima_data_participacao` field

## Database Schema

### `daily_progress` Table
```sql
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id),
  challenge_day INTEGER (1-7),
  date DATE,
  tasks_completed JSONB,
  points_earned INTEGER, -- This field persists across task resets
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_day)
);
```

### Key Design Decisions

1. **Points Persistence**: Points are stored separately from task completion state
2. **Cumulative Scoring**: Total points are calculated by summing all daily progress entries
3. **Task Independence**: Task resets do not affect points earned
4. **Legacy Compatibility**: New system works alongside existing points system

## Usage Examples

### Recording Daily Progress
```typescript
// Record progress for day 3 with 150 points
await recordDailyProgress('user-123', 3, { hydration: true, workout: true }, 150);
```

### Updating Tasks Without Losing Points
```typescript
// Update tasks for day 3, preserving existing 150 points
await updateDailyProgress('user-123', 3, { hydration: true, workout: false }, 100);
// Points remain 150, only tasks are updated
```

### Resetting Tasks While Preserving Points
```typescript
// Reset all tasks for day 2 but keep the 200 points earned
await resetDailyTasks('user-123', 2);
```

### Adding Bonus Points
```typescript
// Add 50 bonus points to day 4 without affecting tasks
await addPointsToDay('user-123', 4, 50);
```

### Getting Total Points
```typescript
// Get cumulative points across all challenge days
const totalPoints = await calculateTotalChallengePoints('user-123');
```

## Requirements Fulfilled

- **5.1**: Points accumulate across days without reset ✅
- **5.2**: Daily task reset is decoupled from points persistence ✅
- **5.3**: Points are maintained across all challenge days ✅
- **5.4**: Functions calculate total points across all challenge days ✅
- **5.5**: Cumulative scoring system implemented ✅

## Testing

The system includes comprehensive tests that verify:
- Points persistence across task updates
- Task reset without points loss
- Cumulative scoring calculations
- Legacy system integration
- Points breakdown functionality

Run tests with:
```bash
npx vitest run src/lib/supabase/__tests__/pointsPersistence.integration.test.ts
```