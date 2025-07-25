import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfilePhotoSection from '../ProfilePhotoSection';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ 
          data: { publicUrl: 'https://example.com/photo.jpg' } 
        }),
        remove: vi.fn().mockResolvedValue({ data: {}, error: null })
      })
    }
  }
}));

vi.mock('@/lib/validation', () => ({
  validateImageFile: vi.fn().mockReturnValue({ isValid: true })
}));

vi.mock('@/lib/imageUtils', () => ({
  compressImage: vi.fn().mockResolvedValue(new File([''], 'test.jpg')),
  createImagePreview: vi.fn().mockReturnValue('blob:test-url'),
  revokeImagePreview: vi.fn()
}));

vi.mock('@/lib/errorUtils', () => ({
  handleError: vi.fn().mockReturnValue({ message: 'Test error' }),
  getErrorMessage: vi.fn().mockReturnValue('Test error message')
}));

describe('ProfilePhotoSection', () => {
  const defaultProps = {
    userId: 'test-user-id',
    onPhotoUpload: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders circular avatar with placeholder when no photo', () => {
    render(<ProfilePhotoSection {...defaultProps} />);
    
    // Should show user icon placeholder
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders current photo when provided', () => {
    render(
      <ProfilePhotoSection 
        {...defaultProps} 
        currentPhotoUrl="https://example.com/current-photo.jpg" 
      />
    );
    
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/current-photo.jpg');
  });

  it('shows upload area with drag and drop functionality', () => {
    render(<ProfilePhotoSection {...defaultProps} />);
    
    expect(screen.getByText('Clique ou arraste uma foto')).toBeInTheDocument();
    expect(screen.getByText('JPG, PNG, WEBP até 5MB')).toBeInTheDocument();
  });

  it('accepts file input with correct file types', () => {
    render(<ProfilePhotoSection {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /escolher foto/i })
      .parentElement?.querySelector('input[type="file"]');
    
    expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png,.webp');
  });

  it('shows progress indicator when uploading', () => {
    render(<ProfilePhotoSection {...defaultProps} uploading={true} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/enviando foto/i)).toBeInTheDocument();
  });

  it('handles file selection and shows preview', async () => {
    const { validateImageFile } = await import('@/lib/validation');
    const { createImagePreview } = await import('@/lib/imageUtils');
    
    render(<ProfilePhotoSection {...defaultProps} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByRole('button', { name: /escolher foto/i })
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(validateImageFile).toHaveBeenCalledWith(file);
      expect(createImagePreview).toHaveBeenCalledWith(file);
    });
  });
});