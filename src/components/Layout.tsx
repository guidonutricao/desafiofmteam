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
      <header className="bg-card/80 backdrop-blur-md border-b border-border/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gold-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Desafio Shape Express</h1>
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
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/20 px-4 py-2">
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
      <aside className="hidden lg:block fixed left-0 top-[73px] bottom-0 w-64 bg-card/50 backdrop-blur-md border-r border-border/20 p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'text-gold bg-gold/10 border border-gold/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Ajuste do conteúdo para desktop com sidebar */}
      <style>{`
        @media (min-width: 1024px) {
          main {
            margin-left: 16rem;
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