-- Criar enum para tipos de treino
CREATE TYPE public.tipo_treino_enum AS ENUM ('casa', 'academia', 'ar_livre', 'outro');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  foto_url VARCHAR(255),
  peso_atual NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de desafios diários
CREATE TABLE public.desafios_diarios (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hidratacao BOOLEAN NOT NULL DEFAULT FALSE,
  sono_qualidade BOOLEAN NOT NULL DEFAULT FALSE,
  atividade_fisica BOOLEAN NOT NULL DEFAULT FALSE,
  seguiu_dieta BOOLEAN NOT NULL DEFAULT FALSE,
  registro_visual BOOLEAN NOT NULL DEFAULT FALSE,
  pontuacao_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- Tabela de pontuações acumuladas
CREATE TABLE public.pontuacoes (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  pontuacao_total INTEGER NOT NULL DEFAULT 0,
  dias_consecutivos INTEGER NOT NULL DEFAULT 0,
  ultima_data_participacao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de planos de dieta
CREATE TABLE public.planos_dieta (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  peso_min NUMERIC(5,2) NOT NULL,
  peso_max NUMERIC(5,2) NOT NULL,
  arquivo_url VARCHAR(255),
  is_vegetariano BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de planos de treino
CREATE TABLE public.planos_treino (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  arquivo_url VARCHAR(255),
  tipo_treino tipo_treino_enum NOT NULL,
  frequencia INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de mensagens motivacionais
CREATE TABLE public.mensagens_motivacionais (
  id SERIAL PRIMARY KEY,
  mensagem TEXT NOT NULL,
  autor VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de cards de resultado
CREATE TABLE public.cards_resultado (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  icone_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desafios_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontuacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_dieta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_motivacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards_resultado ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para desafios_diarios
CREATE POLICY "Users can view their own daily challenges" ON public.desafios_diarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily challenges" ON public.desafios_diarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily challenges" ON public.desafios_diarios
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para pontuacoes
CREATE POLICY "Users can view all scores for ranking" ON public.pontuacoes
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own scores" ON public.pontuacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores" ON public.pontuacoes
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para tabelas públicas (todos podem ler)
CREATE POLICY "Anyone can view diet plans" ON public.planos_dieta
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view workout plans" ON public.planos_treino
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view motivational messages" ON public.mensagens_motivacionais
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view result cards" ON public.cards_resultado
  FOR SELECT USING (TRUE);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_desafios_diarios_updated_at
  BEFORE UPDATE ON public.desafios_diarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pontuacoes_updated_at
  BEFORE UPDATE ON public.pontuacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'));
  
  INSERT INTO public.pontuacoes (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar bucket para uploads de fotos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view all profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );