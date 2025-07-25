/**
 * Integration tests for ProfilePhotoSection with photo upload
 * Requirements: 2.3, 2.4, 2.5, 7.3
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfilePhotoSection from '../ProfilePhotoSection';
import { uploadProfilePhoto } from '@/lib/photoUploadUtils';

// Mock the photo upload utility
vi.mock('@/lib/photoUploadUtils', () => ({
  uploadProfilePhoto: vi.fn()
}));

// Mock other dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/lib/validation', () => ({
  validateImageFile: vi.fn(() => ({ isValid: true }))
}));

vi.mock('@/lib/imageUtils', () => ({
  createImagePreview: vi.fn(() => 'blob:preview-url'),
  revokeImagePreview: vi.fn()
}));

vi.mock('@/lib/errorUtils', () => ({
  handleError: vi.fn((error) => ({ message: error.message })),
  getErrorMessage: vi.fn((error) => error.message)
}));

vi.mock('@/hooks/use-confirmation', () => ({
  useConfirmation: () => ({
    confirm: vi.fn(() => Promise.resolve(true)),
    isOpen: false,
    options: {},
    handleConfirm: vi.fn(),
    handleCancel: vi.fn()
  })
}));

// Mock UI components
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img data-testid="avatar-image" src={src} alt={alt} />
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />
}));

vi.mock('@/components/ConfirmationDialog', () => ({
  ConfirmationDialog: () => <div data-testid="confirmation-dialog" />
}));

describe('ProfilePhotoSection Integration', () => {
  const defaultProps = {
    userId: 'user123',
    onPhotoUpload: vi.fn(),
    uploading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate with photo upload utility correctly', async () => {
    const mockUploadResult = {
      success: true,
      photoUrl: 'https://example.com/new-photo.jpg'
    };

    vi.mocked(uploadProfilePhoto).mockResolvedValue(mockUploadResult);

    render(<ProfilePhotoSection {...defaultProps} />);

    // Create a test file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Find file input and upload file
    const fileInput = screen.getByRole('button', { name: /escolher foto/i });
    fireEvent.click(fileInput);

    // Simulate file selection
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(hiddenInput);

    // Wait for preview to appear and click upload
    await waitFor(() => {
      expect(screen.getByText(/confirmar upload/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/confirmar upload/i);
    fireEvent.click(uploadButton);

    // Wait for upload to complete
    await waitFor(() => {
      expect(uploadProfilePhoto).toHaveBeenCalledWith(
        file,
        'user123',
        undefined,
        {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.8,
          outputFormat: 'jpeg'
        },
        expect.any(Function)
      );
    });

    // Verify callback was called with new photo URL
    expect(defaultProps.onPhotoUpload).toHaveBeenCalledWith(
      'https://example.com/new-photo.jpg'
    );
  });

  it('should handle photo upload errors correctly', async () => {
    const mockUploadResult = {
      success: false,
      error: 'Upload failed'
    };

    vi.mocked(uploadProfilePhoto).mockResolvedValue(mockUploadResult);

    render(<ProfilePhotoSection {...defaultProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Simulate file selection and upload
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(hiddenInput);

    await waitFor(() => {
      expect(screen.getByText(/confirmar upload/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/confirmar upload/i);
    fireEvent.click(uploadButton);

    // Wait for error handling
    await waitFor(() => {
      expect(uploadProfilePhoto).toHaveBeenCalled();
    });

    // Verify callback was not called on error
    expect(defaultProps.onPhotoUpload).not.toHaveBeenCalled();
  });

  it('should pass current photo URL for deletion', async () => {
    const currentPhotoUrl = 'https://example.com/old-photo.jpg';
    const mockUploadResult = {
      success: true,
      photoUrl: 'https://example.com/new-photo.jpg'
    };

    vi.mocked(uploadProfilePhoto).mockResolvedValue(mockUploadResult);

    render(
      <ProfilePhotoSection 
        {...defaultProps} 
        currentPhotoUrl={currentPhotoUrl}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Simulate file selection and upload
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(hiddenInput);

    await waitFor(() => {
      expect(screen.getByText(/confirmar upload/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/confirmar upload/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(uploadProfilePhoto).toHaveBeenCalledWith(
        file,
        'user123',
        currentPhotoUrl, // Should pass current photo URL for deletion
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  it('should show progress during upload', async () => {
    let progressCallback: any;
    
    vi.mocked(uploadProfilePhoto).mockImplementation(async (file, userId, currentUrl, options, onProgress) => {
      progressCallback = onProgress;
      
      // Simulate progress updates
      if (onProgress) {
        onProgress({ stage: 'compressing', progress: 25, message: 'Compressing...' });
        onProgress({ stage: 'uploading', progress: 50, message: 'Uploading...' });
        onProgress({ stage: 'updating', progress: 90, message: 'Updating...' });
        onProgress({ stage: 'complete', progress: 100, message: 'Complete!' });
      }
      
      return { success: true, photoUrl: 'https://example.com/photo.jpg' };
    });

    render(<ProfilePhotoSection {...defaultProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Simulate file selection and upload
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(hiddenInput);

    await waitFor(() => {
      expect(screen.getByText(/confirmar upload/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/confirmar upload/i);
    fireEvent.click(uploadButton);

    // Verify progress callback was set up
    await waitFor(() => {
      expect(progressCallback).toBeDefined();
    });
  });

  it('should use correct file naming convention', async () => {
    const mockUploadResult = {
      success: true,
      photoUrl: 'https://example.com/user123.jpg'
    };

    vi.mocked(uploadProfilePhoto).mockResolvedValue(mockUploadResult);

    render(<ProfilePhotoSection {...defaultProps} />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });

    // Simulate file selection and upload
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(hiddenInput);

    await waitFor(() => {
      expect(screen.getByText(/confirmar upload/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/confirmar upload/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(uploadProfilePhoto).toHaveBeenCalledWith(
        file,
        'user123', // Should use user ID in file naming
        undefined,
        expect.objectContaining({
          outputFormat: 'jpeg' // Should convert to jpeg
        }),
        expect.any(Function)
      );
    });
  });
});