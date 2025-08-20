import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/Layout";
import DesafioDiario from "./pages/DesafioDiario";
import Ranking from "./pages/Ranking";
import Dietas from "./pages/Dietas";
import Treinos from "./pages/Treinos";
import Perfil from "./pages/Perfil";
import Login from "./pages/Login";
import CelebrationPage from "./pages/CelebrationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota de login - deve vir primeiro */}
            <Route path="/login" element={<Login />} />
            
            {/* Rota raiz com redirecionamento */}
            <Route path="/" element={<Layout><DesafioDiario /></Layout>} />
            
            {/* Rotas protegidas */}
            <Route path="/desafio-diario" element={<Layout><DesafioDiario /></Layout>} />
            <Route path="/celebration" element={<CelebrationPage />} />
            <Route path="/ranking" element={<Layout><Ranking /></Layout>} />
            <Route path="/dietas" element={<Layout><Dietas /></Layout>} />
            <Route path="/treinos" element={<Layout><Treinos /></Layout>} />
            <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
            
            {/* Rota catch-all para 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
