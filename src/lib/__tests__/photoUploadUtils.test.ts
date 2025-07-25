/**
 * Tests for photo upload utilities
 * Requirements: 2.3, 2.4, 2.5, 7.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadProfilePhoto, isValidImageFile, getProfilePhotoPath, getProfilePhotoUrl } from '../photoUploadUtils';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/photo.jpg' }
        }))
      }))
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn() }))
    }))
  }
}));

// Mock image compression
vi.mock('../imageUtils', () => ({
  compressImage: vi.fn((file) => Promise.resolve(file))
}));

// Mock error handling
vi.mock('../errorUtils', () => ({
  handleError: vi.fn((error) => ({ message: error.message || 'Unknown error' }))
}));

describe('photoUploadUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidImageFile', () => {
    it('should return true for valid image files', () => {
      const validFiles = [
        new File([''], 'test.jpg', { type: 'image/jpeg' }),
        new File([''], 'test.jpeg', { type: 'image/jpeg' }),
        new File([''], 'test.png', { type: 'image/png' }),
        new File([''], 'test.webp', { type: 'image/webp' })
      ];

      validFiles.forEach(file => {
        expect(isValidImageFile(file)).toBe(true);
      });
    });

    it('should return false for invalid image files', () => {
      const invalidFiles = [
        new File([''], 'test.txt', { type: 'text/plain' }),
        new File([''], 'test.pdf', { type: 'application/pdf' }),
        new File([''], 'test.gif', { type: 'image/gif' }),
        new File([''], 'test', { type: 'image/jpeg' }) // no extension
      ];

      invalidFiles.forEach(file => {
        expect(isValidImageFile(file)).toBe(false);
      });
    });
  });

  describe('getProfilePhotoPath', () => {
    it('should generate correct path with user ID and extension', () => {
      const userId = 'user123';
      const extension = 'jpg';
      const expected = 'user123/user123.jpg';
      
      expect(getProfilePhotoPath(userId, extension)).toBe(expected);
    });

    it('should use default jpg extension when not provided', () => {
      const userId = 'user123';
      const expected = 'user123/user123.jpg';
      
      expect(getProfilePhotoPath(userId)).toBe(expected);
    });
  });

  describe('getProfilePhotoUrl', () => {
    it('should generate public URL for profile photo', () => {
      const userId = 'user123';
      const extension = 'jpg';
      
      const url = getProfilePhotoUrl(userId, extension);
      
      expect(url).toBe('https://example.com/photo.jpg');
      expect(supabase.storage.from).toHaveBeenCalledWith('profile-photos');
    });
  });

  describe('uploadProfilePhoto', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const userId = 'user123';
    const currentPhotoUrl = 'https://example.com/old-photo.jpg';

    it('should successfully upload photo and update profile', async () => {
      // Mock successful upload
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/new-photo.jpg' }
        }))
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: mockEq
        }))
      } as any);

      const result = await uploadProfilePhoto(mockFile, userId, currentPhotoUrl);

      expect(result.success).toBe(true);
      expect(result.photoUrl).toBe('https://example.com/new-photo.jpg');
      expect(mockUpload).toHaveBeenCalledWith(
        `${userId}/${userId}.jpg`,
        mockFile,
        {
          cacheControl: '3600',
          upsert: true
        }
      );
    });

    it('should handle upload errors gracefully', async () => {
      // Mock upload error
      const mockUpload = vi.fn().mockResolvedValue({ 
        error: new Error('Upload failed') 
      });
      
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/photo.jpg' }
        }))
      } as any);

      const result = await uploadProfilePhoto(mockFile, userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should call progress callback during upload', async () => {
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const progressCallback = vi.fn();
      
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/photo.jpg' }
        }))
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: mockEq
        }))
      } as any);

      await uploadProfilePhoto(mockFile, userId, undefined, {}, progressCallback);

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'compressing',
          progress: expect.any(Number),
          message: expect.any(String)
        })
      );
    });

    it('should use correct file naming convention', async () => {
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/photo.jpg' }
        }))
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: mockEq
        }))
      } as any);

      const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
      await uploadProfilePhoto(pngFile, userId);

      // Should use user_id.extension format (Requirement 2.4)
      expect(mockUpload).toHaveBeenCalledWith(
        `${userId}/${userId}.jpg`, // Should convert to jpg due to outputFormat: 'jpeg'
        expect.any(File),
        expect.any(Object)
      );
    });
  });
});