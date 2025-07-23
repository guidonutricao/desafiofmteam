# Requirements Document

## Introduction

Esta feature implementa uma página de perfil moderna e responsiva para usuários autenticados, permitindo visualização e edição de dados pessoais, upload de foto de perfil e gerenciamento de credenciais de autenticação. A página utiliza Tailwind CSS com design baseado em cores Zinc 900 e Amber 500, integrada ao Supabase para autenticação e storage.

## Requirements

### Requirement 1

**User Story:** Como um usuário autenticado, eu quero visualizar e editar meus dados pessoais em uma interface moderna e intuitiva, para que eu possa manter minhas informações atualizadas.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de perfil THEN o sistema SHALL exibir uma interface responsiva com design moderno usando Tailwind CSS
2. WHEN a página é carregada THEN o sistema SHALL exibir os dados atuais do usuário (nome, email, foto de perfil)
3. WHEN o usuário está em dispositivo móvel THEN o sistema SHALL adaptar o layout para mobile-first design
4. WHEN a página é exibida THEN o sistema SHALL usar cores baseadas em Zinc 900 para fundo/texto e Amber 500 para elementos de destaque

### Requirement 2

**User Story:** Como um usuário, eu quero fazer upload e visualizar minha foto de perfil, para que eu possa personalizar minha conta com minha imagem.

#### Acceptance Criteria

1. WHEN o usuário seleciona uma imagem THEN o sistema SHALL validar se a extensão é .jpg, .jpeg, .png ou .webp
2. WHEN uma imagem válida é selecionada THEN o sistema SHALL exibir um preview da imagem antes do upload
3. WHEN o usuário confirma o upload THEN o sistema SHALL enviar a imagem para o bucket 'avatars' no Supabase Storage
4. WHEN a imagem é enviada THEN o sistema SHALL nomear o arquivo como {user_id}.{extensão}
5. WHEN o upload é concluído THEN o sistema SHALL atualizar a URL da imagem no perfil do usuário
6. WHEN não há foto de perfil THEN o sistema SHALL exibir um placeholder circular com ícone de usuário
7. WHEN há foto de perfil THEN o sistema SHALL exibir a imagem atual em formato circular

### Requirement 3

**User Story:** Como um usuário, eu quero editar meus dados pessoais (nome e email), para que eu possa manter minhas informações corretas e atualizadas.

#### Acceptance Criteria

1. WHEN o usuário acessa o formulário THEN o sistema SHALL exibir campos editáveis para nome e email
2. WHEN o usuário edita o nome THEN o sistema SHALL validar que o campo não está vazio
3. WHEN o usuário edita o email THEN o sistema SHALL validar o formato do email
4. WHEN o usuário clica em "Salvar dados pessoais" THEN o sistema SHALL atualizar os dados via Supabase
5. WHEN os dados são salvos com sucesso THEN o sistema SHALL exibir feedback visual de sucesso
6. WHEN ocorre erro ao salvar THEN o sistema SHALL exibir feedback visual de erro

### Requirement 4

**User Story:** Como um usuário, eu quero alterar minha senha de forma segura, para que eu possa manter minha conta protegida.

#### Acceptance Criteria

1. WHEN o usuário acessa a seção de senha THEN o sistema SHALL exibir um campo de input para nova senha
2. WHEN o usuário digita a senha THEN o sistema SHALL ter opção de exibir/esconder a senha
3. WHEN o usuário insere nova senha THEN o sistema SHALL validar que tem no mínimo 6 caracteres
4. WHEN a senha é válida e usuário clica "Atualizar senha" THEN o sistema SHALL atualizar via supabase.auth.updateUser()
5. WHEN a senha é atualizada com sucesso THEN o sistema SHALL exibir feedback visual de sucesso
6. WHEN ocorre erro na atualização THEN o sistema SHALL exibir feedback visual de erro

### Requirement 5

**User Story:** Como um usuário, eu quero ter confirmação visual das minhas ações, para que eu saiba quando operações foram realizadas com sucesso ou falharam.

#### Acceptance Criteria

1. WHEN qualquer operação é realizada THEN o sistema SHALL exibir feedback visual apropriado
2. WHEN uma operação é bem-sucedida THEN o sistema SHALL exibir toast ou ícone de sucesso
3. WHEN uma operação falha THEN o sistema SHALL exibir toast ou ícone de erro com mensagem descritiva
4. WHEN o usuário vai salvar alterações THEN o sistema SHALL solicitar confirmação antes de executar
5. WHEN há campos obrigatórios vazios THEN o sistema SHALL destacar os campos e impedir o envio

### Requirement 6

**User Story:** Como um usuário, eu quero uma interface organizada em seções claras, para que eu possa navegar facilmente entre diferentes tipos de configurações.

#### Acceptance Criteria

1. WHEN a página é exibida THEN o sistema SHALL organizar o conteúdo em seções bem separadas
2. WHEN as seções são exibidas THEN o sistema SHALL incluir "Dados Pessoais", "Alterar Senha" e "Foto de Perfil"
3. WHEN os componentes são renderizados THEN o sistema SHALL usar classes como rounded-2xl, shadow-md, gap-y-4
4. WHEN há múltiplas ações THEN o sistema SHALL ter botões separados para cada funcionalidade
5. WHEN o layout é exibido THEN o sistema SHALL manter consistência visual e espaçamento adequado

### Requirement 7

**User Story:** Como um usuário, eu quero que meus dados sejam armazenados de forma segura e eficiente, para que minhas informações estejam sempre disponíveis e protegidas.

#### Acceptance Criteria

1. WHEN dados são salvos THEN o sistema SHALL armazenar nome e foto via tabela profiles do Supabase
2. WHEN email/senha são alterados THEN o sistema SHALL usar supabase.auth.updateUser()
3. WHEN imagem é enviada THEN o sistema SHALL salvar no Storage e URL pública na tabela profiles
4. WHEN dados são atualizados THEN o sistema SHALL manter integridade referencial com auth.users
5. WHEN operações são realizadas THEN o sistema SHALL seguir as políticas de segurança RLS configuradas