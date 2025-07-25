import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/Layout";
import DesafioDiario from "./pages/DesafioDiario";
import Ranking from "./pages/Ranking";
import Dietas from "./pages/Dietas";
import Treinos from "./pages/Treinos";
import Perfil from "./pages/Perfil";
import Login from "./pages/Login";
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
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout><DesafioDiario /></Layout>} />
            <Route path="/ranking" element={<Layout><Ranking /></Layout>} />
            <Route path="/dietas" element={<Layout><Dietas /></Layout>} />
            <Route path="/treinos" element={<Layout><Treinos /></Layout>} />
            <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
