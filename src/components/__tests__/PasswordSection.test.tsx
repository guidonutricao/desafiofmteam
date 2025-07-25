import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PasswordSection } from '../PasswordSection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/hooks/use-toast');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn()
    }
  }
}));

const mockToast = vi.fn();
const mockOnPasswordUpdate = vi.fn();

describe('PasswordSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  it('renders password section with correct elements', () => {
    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    expect(screen.getByText('Alterar Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Nova Senha *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Nova Senha *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar senha' })).toBeInTheDocument();
  });

  it('shows/hides password when toggle button is clicked', () => {
    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    const passwordInput = screen.getByLabelText('Nova Senha *');
    const toggleButton = screen.getByLabelText('Mostrar senha');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Ocultar senha')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('validates minimum password length', async () => {
    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    const passwordInput = screen.getByLabelText('Nova Senha *');
    const confirmInput = screen.getByLabelText('Confirmar Nova Senha *');
    const submitButton = screen.getByRole('button', { name: 'Atualizar senha' });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Erro de validação",
      description: "Por favor, corrija os erros no formulário.",
      variant: "destructive"
    });
  });

  it('validates password confirmation matching', async () => {
    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    const passwordInput = screen.getByLabelText('Nova Senha *');
    const confirmInput = screen.getByLabelText('Confirmar Nova Senha *');
    const submitButton = screen.getByRole('button', { name: 'Atualizar senha' });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('successfully updates password', async () => {
    (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    const passwordInput = screen.getByLabelText('Nova Senha *');
    const confirmInput = screen.getByLabelText('Confirmar Nova Senha *');
    const submitButton = screen.getByRole('button', { name: 'Atualizar senha' });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      });
    });

    expect(mockOnPasswordUpdate).toHaveBeenCalledWith('newpassword123');
    expect(mockToast).toHaveBeenCalledWith({
      title: "Senha atualizada!",
      description: "Sua senha foi alterada com sucesso."
    });
  });

  it('handles password update error', async () => {
    const error = new Error('Password update failed');
    (supabase.auth.updateUser as any).mockResolvedValue({ error });

    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    const passwordInput = screen.getByLabelText('Nova Senha *');
    const confirmInput = screen.getByLabelText('Confirmar Nova Senha *');
    const submitButton = screen.getByRole('button', { name: 'Atualizar senha' });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro ao atualizar senha",
        description: expect.any(String),
        variant: "destructive"
      });
    });
  });

  it('disables submit button when updating', () => {
    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Atualizando senha...' });
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when form is not dirty', () => {
    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Atualizar senha' });
    expect(submitButton).toBeDisabled();
  });

  it('shows dirty state indicator when form has changes', () => {
    render(
      <PasswordSection 
        onPasswordUpdate={mockOnPasswordUpdate}
        updating={false}
      />
    );

    const passwordInput = screen.getByLabelText('Nova Senha *');
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

    expect(screen.getByText('Você tem alterações não salvas')).toBeInTheDocument();
  });
});