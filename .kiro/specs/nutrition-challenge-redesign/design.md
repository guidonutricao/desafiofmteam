# Design Document

## Overview

Este documento detalha o design completo para a recriação do front-end da aplicação de desafio de 7 dias para consultoria de nutrição. O projeto utilizará React + TypeScript + Vite com ShadCN/UI e Tailwind CSS, implementando um design moderno em dark mode com paleta amber-500 e zinc-900.

## Architecture

### Tech Stack
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS com ShadCN/UI components
- **Icons**: Lucide React (já instalado)
- **Routing**: React Router DOM
- **State Management**: React Query + Context API
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Animations**: CSS transitions + Tailwind animate (Framer Motion opcional)

### Project Structure
```
src/
├── components/
│   ├── ui/                    # ShadCN components
│   ├── layout/               # Layout components
│   ├── challenge/            # Challenge-specific components
│   ├── ranking/              # Ranking components
│   ├── diet/                 # Diet plan components
│   ├── workout/              # Workout components
│   └── profile/              # Profile components
├── pages/                    # Page components
├── hooks/                    # Custom hooks
├── lib/                      # Utilities and configurations
├── types/                    # TypeScript type definitions
└── styles/                   # Global styles
```

## Components and Interfaces

### Design System

#### Color Palette
```css
/* Primary Colors */
--primary: 45 93% 58%;        /* amber-500 equivalent */
--background: 39 3% 9%;       /* zinc-900 equivalent */
--foreground: 39 3% 95%;      /* zinc-100 for high contrast text */
--muted-foreground: 39 3% 78%; /* zinc-300 for secondary text */

/* Card Colors */
--card: 39 3% 11%;            /* zinc-800 for cards */
--card-foreground: 39 3% 95%; /* zinc-100 for card text */

/* Interactive States */
--accent: 45 93% 58%;         /* amber-500 for highlights */
--accent-foreground: 39 3% 9%; /* zinc-900 for accent text */

/* Additional text hierarchy for better readability */
--text-primary: 39 3% 95%;    /* zinc-100 - Main text, highest contrast */
--text-secondary: 39 3% 83%;  /* zinc-300 - Secondary text */
--text-muted: 39 3% 64%;      /* zinc-400 - Muted text, labels */
--text-disabled: 39 3% 45%;   /* zinc-500 - Disabled text */
```

#### Typography Scale
```css
/* Headings - Using high contrast text */
.text-display: 3.5rem/1.1 font-bold text-zinc-100    /* Page titles */
.text-h1: 2.5rem/1.2 font-bold text-zinc-100         /* Section titles */
.text-h2: 2rem/1.3 font-semibold text-zinc-100       /* Subsection titles */
.text-h3: 1.5rem/1.4 font-semibold text-zinc-100     /* Card titles */

/* Body Text - Optimized contrast hierarchy */
.text-body-lg: 1.125rem/1.6 font-normal text-zinc-100 /* Large body text */
.text-body: 1rem/1.5 font-normal text-zinc-200        /* Regular body text */
.text-body-sm: 0.875rem/1.4 font-normal text-zinc-300 /* Small body text */
.text-caption: 0.75rem/1.3 font-medium text-zinc-400  /* Captions and labels */

/* Contrast ratios achieved:
   - zinc-100 on zinc-900: ~18.1:1 (Excellent)
   - zinc-200 on zinc-900: ~15.8:1 (Excellent) 
   - zinc-300 on zinc-900: ~12.6:1 (Excellent)
   - zinc-400 on zinc-900: ~8.9:1 (Very Good)
*/
```

#### Spacing System
```css
/* Consistent spacing scale */
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Core Components

#### 1. Layout Components

**AppLayout**
```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}
```
- Dark background (zinc-900)
- Responsive navigation sidebar/bottom bar
- Consistent padding and spacing

**Navigation**
```typescript
interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
}
```
- Mobile: Bottom navigation bar
- Desktop: Side navigation
- Active state with amber-500 highlight

#### 2. Challenge Components

**DailyChallengeCard**
```typescript
interface DailyChallengeCardProps {
  title: string;
  description: string;
  completed: boolean;
  icon: LucideIcon;
  onToggle: () => void;
}
```
- Card with zinc-800 background
- Amber-500 accent for completed state
- Smooth hover and click animations
- Progress indicator

**MotivationalQuote**
```typescript
interface MotivationalQuoteProps {
  quote: string;
  author?: string;
}
```
- Prominent display with amber-500 accent
- Elegant typography
- Subtle background gradient

**ResultsCard**
```typescript
interface ResultsCardProps {
  completedTasks: number;
  totalTasks: number;
  streak: number;
  points: number;
}
```
- Visual progress indicators
- Animated counters
- Amber-500 highlights for achievements

**Statistics Display Styling**
```css
/* Statistics components (Pontos Totais, Tarefas Hoje, Dias Seguidos) */
.stats-container {
  /* Numbers and text must use white color for maximum visibility and consistency */
  color: theme('colors.white'); /* Pure white for both numbers and labels */
}

.stats-number {
  font-weight: 600; /* Semi-bold for emphasis */
  color: theme('colors.white'); /* CRITICAL: Numbers must be white */
}

.stats-label {
  font-weight: 400; /* Normal weight */
  color: theme('colors.white'); /* CRITICAL: Labels must be white to match numbers */
}

/* Implementation rule: All statistics text must use pure white (#ffffff)
   Example: "0 Pontos Totais" - both "0" and "Pontos Totais" use white
   Example: "0/5 Tarefas Hoje" - "0", "/", "5", and "Tarefas Hoje" all use white
   Example: "0 Dias Seguidos" - both "0" and "Dias Seguidos" use white
   
   Alternative Tailwind classes:
   - text-white for pure white
   - Or text-zinc-100 for slightly softer white if needed
*/
```

#### 3. Ranking Components

**RankingList**
```typescript
interface RankingItem {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
}
```
- Card-based layout for each participant
- Special highlighting for current user
- Avatar, name, and points display
- Responsive grid/list layout

#### 4. Diet Plan Components

**DietPlanCard**
```typescript
interface DietPlanCardProps {
  id: string;
  title: string;
  description: string;
  targetWeight: string;
  isVegetarian: boolean;
  downloadUrl: string;
  previewUrl?: string;
}
```
- Clean card design with hover effects
- Filter badges (weight, vegetarian)
- Amber-500 download/view buttons
- Responsive grid layout

**DietFilters**
```typescript
interface DietFiltersProps {
  weightFilter: string;
  vegetarianFilter: boolean;
  onWeightChange: (weight: string) => void;
  onVegetarianChange: (isVegetarian: boolean) => void;
}
```
- Toggle switches and select dropdowns
- Amber-500 active states
- Clear visual feedback

#### 5. Workout Components

**WorkoutCard**
```typescript
interface WorkoutCardProps {
  id: string;
  title: string;
  frequency: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  onClick: () => void;
}
```
- Clickable cards with hover effects
- Difficulty indicators with color coding
- Exercise preview
- Responsive layout

#### 6. Profile Components

**AvatarUpload**
```typescript
interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => void;
  isLoading?: boolean;
}
```
- Drag & drop or click to upload
- Image preview with crop functionality
- Loading states with amber-500 spinner

**ProfileForm**
```typescript
interface ProfileFormProps {
  initialData: UserProfile;
  onSubmit: (data: UserProfile) => void;
  isLoading?: boolean;
}
```
- Form validation with visual feedback
- Amber-500 focus states
- Success/error messaging

## Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  weight: number;
  height: number;
  goal: 'lose' | 'maintain' | 'gain';
  createdAt: Date;
  updatedAt: Date;
}
```

### Daily Challenge
```typescript
interface DailyChallenge {
  id: string;
  userId: string;
  date: Date;
  tasks: {
    hydration: boolean;
    sleep: boolean;
    workout: boolean;
    diet: boolean;
    photo: boolean;
  };
  points: number;
  completedAt?: Date;
}
```

### Diet Plan
```typescript
interface DietPlan {
  id: string;
  title: string;
  description: string;
  targetWeight: string;
  isVegetarian: boolean;
  calories: number;
  meals: Meal[];
  downloadUrl: string;
  previewUrl?: string;
}
```

### Workout
```typescript
interface Workout {
  id: string;
  title: string;
  frequency: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  instructions: string[];
}
```

### Ranking Entry
```typescript
interface RankingEntry {
  userId: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  position: number;
  streak: number;
  completedChallenges: number;
}
```

## Error Handling

### Error Boundary
- Global error boundary component
- Graceful fallback UI with amber-500 accents
- Error reporting to logging service

### Form Validation
- Real-time validation with visual feedback
- Amber-500 for success states
- Red for error states with clear messaging
- Accessible error announcements

### Network Errors
- Loading states with amber-500 spinners
- Retry mechanisms with user feedback
- Offline state handling

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing for custom hooks
- Utility function testing

### Integration Testing
- Page-level testing
- User flow testing
- API integration testing

### Visual Testing
- Responsive design testing
- Dark mode consistency
- Accessibility testing (WCAG 2.1 AA)

### Performance Testing
- Core Web Vitals monitoring
- Bundle size optimization
- Image optimization

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Mobile (< 768px)
- Bottom navigation
- Single column layouts
- Touch-friendly button sizes (min 44px)
- Simplified card layouts

### Tablet (768px - 1024px)
- Side navigation option
- Two-column layouts where appropriate
- Optimized card sizes

### Desktop (> 1024px)
- Side navigation
- Multi-column layouts
- Hover states and interactions
- Larger content areas

## Accessibility

### Text Readability and Contrast
- **Primary text (zinc-100)**: 18.1:1 contrast ratio - Excellent readability for headings and important content
- **Secondary text (zinc-200)**: 15.8:1 contrast ratio - Excellent for body text
- **Tertiary text (zinc-300)**: 12.6:1 contrast ratio - Very good for supporting text
- **Muted text (zinc-400)**: 8.9:1 contrast ratio - Good for labels and captions
- **Minimum contrast**: All text exceeds WCAG AAA standards (7:1)

### WCAG 2.1 AA Compliance
- Color contrast ratios > 4.5:1 (all text exceeds 8:1)
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Semantic HTML
- Proper heading hierarchy
- ARIA labels and descriptions
- Form labels and validation messages
- Skip links for navigation

### Interactive Elements
- Focus indicators with amber-500
- Hover states for mouse users
- Touch targets minimum 44px
- Loading states with announcements

## Animation and Interactions

### Micro-interactions
- Button hover/click feedback
- Card hover elevations
- Form field focus animations
- Loading spinners with amber-500

### Page Transitions
- Smooth route transitions
- Stagger animations for lists
- Progressive loading states

### Performance Considerations
- CSS transforms over position changes
- Will-change property for animations
- Reduced motion preferences support