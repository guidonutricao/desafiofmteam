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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
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

  const getActiveIconBg = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-yellow-400 to-orange-500', // Desafio
      'bg-gradient-to-br from-blue-400 to-blue-600',     // Ranking
      'bg-gradient-to-br from-green-400 to-green-600',   // Dietas
      'bg-gradient-to-br from-purple-400 to-purple-600', // Treinos
      'bg-gradient-to-br from-gray-400 to-gray-600',     // Perfil
    ];
    return colors[index] || colors[0];
  };

  const getMobileActiveIconBg = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-yellow-400 to-orange-500', // Desafio
      'bg-gradient-to-br from-blue-400 to-blue-600',     // Ranking
      'bg-gradient-to-br from-green-400 to-green-600',   // Dietas
      'bg-gradient-to-br from-purple-400 to-purple-600', // Treinos
      'bg-gradient-to-br from-gray-400 to-gray-600',     // Perfil
    ];
    return colors[index] || colors[0];
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-6">
          {/* Header com logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Shape Express</h1>
              <p className="text-sm text-gray-400">by Fabricio Moura</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {navigationItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${isActive
                    ? 'bg-yellow-500/10 text-yellow-400 shadow-sm border border-yellow-500/20'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive
                        ? getActiveIconBg(index)
                        : 'bg-gray-700 group-hover:bg-gray-600'
                      }`}>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                        }`} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="absolute right-4 w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout button */}
          <div className="mt-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Shape Express</h1>
                <p className="text-xs text-gray-400">Seu app de transformação</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 lg:ml-80 px-4 py-6 pb-24 lg:pb-6">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 safe-area-pb z-50">
        <div className="flex items-center justify-around">
          {navigationItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive
                  ? 'text-yellow-400'
                  : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive
                      ? getMobileActiveIconBg(index)
                      : 'bg-gray-700'
                    }`}>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'
                      }`} />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Estilos adicionais */}
      <style>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        @media (max-width: 1023px) {
          body {
            padding-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}