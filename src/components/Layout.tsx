import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { 
  Calendar, 
  Trophy, 
  UtensilsCrossed, 
  Dumbbell, 
  User,
  LogOut 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigationItems = [
    { to: '/', icon: Calendar, label: 'Desafio' },
    { to: '/ranking', icon: Trophy, label: 'Ranking' },
    { to: '/dietas', icon: UtensilsCrossed, label: 'Dietas' },
    { to: '/treinos', icon: Dumbbell, label: 'Treinos' },
    { to: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gold-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Shape Express</h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 container mx-auto px-4 py-6 relative z-20">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/20 px-4 py-2 z-30">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-gold bg-gold/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-[73px] bottom-0 w-72 bg-gradient-card backdrop-blur-xl border-r border-border/30 shadow-xl z-10">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-gold-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Shape Express</h2>
              <p className="text-sm text-muted-foreground">Seu app de transformação</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-3">
          {navigationItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 font-medium relative overflow-hidden ${
                  isActive
                    ? 'text-gold bg-gradient-gold/10 border border-gold/20 shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/20 hover:scale-[1.02] hover:shadow-md'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Background glow effect for active item */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-gold opacity-5 rounded-xl" />
                  )}
                  
                  {/* Icon container with enhanced styling */}
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gold/20 text-gold shadow-sm' 
                      : 'bg-accent/10 text-muted-foreground group-hover:bg-accent/20 group-hover:text-foreground'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  {/* Label with better typography */}
                  <span className="relative z-10 font-semibold tracking-wide">
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-4 w-2 h-2 bg-gold rounded-full shadow-lg" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer with user info or additional content */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-gold-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Bem-vindo!</p>
                <p className="text-xs text-muted-foreground">Continue seu progresso</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Ajuste do conteúdo para desktop com sidebar */}
      <style>{`
        @media (min-width: 1024px) {
          main {
            margin-left: 18rem;
          }
        }
        
        @media (max-width: 1023px) {
          main {
            padding-bottom: 5rem;
          }
        }
      `}</style>
    </div>
  );
}