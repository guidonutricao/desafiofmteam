import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PersonalDataSection } from '../PersonalDataSection';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {}
}));

describe('PersonalDataSection', () => {
  const mockProfile = {
    nome: 'João Silva',
    foto_url: 'https://example.com/photo.jpg'
  };

  const mockProps = {
    profile: mockProfile,
    userEmail: 'joao@example.com',
    onProfileUpdate: vi.fn(),
    saving: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders personal data form with name and email fields', () => {
    render(<PersonalDataSection {...mockProps} />);
    
    expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar dados pessoais/i })).toBeInTheDocument();
  });

  it('displays current profile data in form fields', () => {
    render(<PersonalDataSection {...mockProps} />);
    
    const nameInput = screen.getByDisplayValue('João Silva');
    const emailInput = screen.getByDisplayValue('joao@example.com');
    
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
  });

  it('validates required name field', async () => {
    render(<PersonalDataSection {...mockProps} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    
    // Clear the name field
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });
    
    expect(mockProps.onProfileUpdate).not.toHaveBeenCalled();
  });

  it('validates name minimum length', async () => {
    render(<PersonalDataSection {...mockProps} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    
    // Enter a name that's too short
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument();
    });
    
    expect(mockProps.onProfileUpdate).not.toHaveBeenCalled();
  });

  it('calls onProfileUpdate when form is submitted with valid data', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue(undefined);
    render(<PersonalDataSection {...mockProps} onProfileUpdate={mockOnUpdate} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    
    // Change the name
    fireEvent.change(nameInput, { target: { value: 'João Santos' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        nome: 'João Santos',
        foto_url: 'https://example.com/photo.jpg'
      });
    });
  });

  it('shows loading state when saving', () => {
    render(<PersonalDataSection {...mockProps} saving={true} />);
    
    const submitButton = screen.getByRole('button', { name: /salvando dados pessoais/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Salvando dados pessoais...')).toBeInTheDocument();
  });

  it('disables submit button when no changes are made', () => {
    render(<PersonalDataSection {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when changes are made', () => {
    render(<PersonalDataSection {...mockProps} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    
    // Make a change
    fireEvent.change(nameInput, { target: { value: 'João Santos' } });
    
    expect(submitButton).not.toBeDisabled();
    expect(screen.getByText('Você tem alterações não salvas')).toBeInTheDocument();
  });

  it('shows success toast when profile is updated successfully', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue(undefined);
    render(<PersonalDataSection {...mockProps} onProfileUpdate={mockOnUpdate} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    
    // Change the name and submit
    fireEvent.change(nameInput, { target: { value: 'João Santos' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Dados pessoais atualizados!",
        description: "Suas informações foram salvas com sucesso."
      });
    });
  });

  it('shows error toast when profile update fails', async () => {
    const mockOnUpdate = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<PersonalDataSection {...mockProps} onProfileUpdate={mockOnUpdate} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    
    // Change the name and submit
    fireEvent.change(nameInput, { target: { value: 'João Santos' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro ao salvar",
        description: expect.stringContaining("Network error"),
        variant: "destructive"
      });
    });
  });

  it('clears validation errors when user starts typing', () => {
    render(<PersonalDataSection {...mockProps} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const submitButton = screen.getByRole('button', { name: /salvar dados pessoais/i });
    
    // Trigger validation error
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    // Error should appear
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    
    // Start typing to clear error
    fireEvent.change(nameInput, { target: { value: 'J' } });
    
    // Error should be cleared
    expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<PersonalDataSection {...mockProps} />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    expect(nameInput).toHaveAttribute('required');
    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(emailInput).toBeDisabled();
    expect(screen.getByText('O email não pode ser alterado por questões de segurança')).toBeInTheDocument();
  });
});