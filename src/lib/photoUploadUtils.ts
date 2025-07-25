/**
 * Photo upload utilities for Supabase Storage integration
 * Requirements: 2.3, 2.4, 2.5, 7.3 - Photo upload integration with Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';
import { compressImage } from './imageUtils';
import { handleError } from './errorUtils';

export interface PhotoUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'jpeg' | 'webp' | 'png';
}

export interface PhotoUploadResult {
  success: boolean;
  photoUrl?: string;
  error?: string;
}

export interface PhotoUploadProgress {
  stage: 'compressing' | 'uploading' | 'updating' | 'complete';
  progress: number;
  message: string;
}

const DEFAULT_UPLOAD_OPTIONS: PhotoUploadOptions = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.8,
  outputFormat: 'jpeg'
};

/**
 * Uploads a photo to Supabase Storage with compression and profile update
 * Requirements: 2.3, 2.4, 2.5, 7.3
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string,
  currentPhotoUrl?: string,
  options: PhotoUploadOptions = {},
  onProgress?: (progress: PhotoUploadProgress) => void
): Promise<PhotoUploadResult> {
  try {
    const opts = { ...DEFAULT_UPLOAD_OPTIONS, ...options };

    // Stage 1: Compress image (Requirement 2.5)
    onProgress?.({
      stage: 'compressing',
      progress: 10,
      message: 'Comprimindo imagem...'
    });

    const compressedFile = await compressImage(file, opts);

    onProgress?.({
      stage: 'compressing',
      progress: 25,
      message: 'Imagem comprimida com sucesso'
    });

    // Stage 2: Delete existing photo if it exists
    if (currentPhotoUrl) {
      await deleteExistingPhoto(currentPhotoUrl);
    }

    onProgress?.({
      stage: 'uploading',
      progress: 35,
      message: 'Preparando upload...'
    });

    // Stage 3: Generate file path using user_id.extension format (Requirement 2.4)
    const fileExtension = getFileExtension(compressedFile.name, opts.outputFormat);
    const fileName = `${userId}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    onProgress?.({
      stage: 'uploading',
      progress: 50,
      message: 'Enviando foto...'
    });

    // Stage 4: Upload to 'profile-photos' bucket (Requirement 2.3)
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    onProgress?.({
      stage: 'uploading',
      progress: 75,
      message: 'Upload concluído'
    });

    // Stage 5: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    onProgress?.({
      stage: 'updating',
      progress: 90,
      message: 'Atualizando perfil...'
    });

    // Stage 6: Update photo URL in profiles table (Requirement 7.3)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ foto_url: publicUrl })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Foto de perfil atualizada!'
    });

    return {
      success: true,
      photoUrl: publicUrl
    };

  } catch (error) {
    const appError = handleError(error);
    return {
      success: false,
      error: appError.message
    };
  }
}

/**
 * Deletes existing photo from storage
 */
async function deleteExistingPhoto(photoUrl: string): Promise<void> {
  try {
    // Extract the file path from the photo URL
    const urlParts = photoUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'profile-photos');
    
    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
      const existingFilePath = urlParts.slice(bucketIndex + 1).join('/');
      
      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([existingFilePath]);

      if (error) {
        // Log but don't throw - deletion failure shouldn't prevent new upload
        console.warn('Failed to delete existing photo:', error);
      }
    }
  } catch (error) {
    // Log but don't throw - deletion failure shouldn't prevent new upload
    console.warn('Error during photo deletion:', error);
  }
}

/**
 * Gets file extension, defaulting to output format if not available
 */
function getFileExtension(fileName: string, outputFormat?: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (extension && ['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    return extension;
  }
  
  return outputFormat === 'jpeg' ? 'jpg' : (outputFormat || 'jpg');
}

/**
 * Validates if a file is a supported image type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  return validTypes.includes(file.type) && 
         extension !== undefined && 
         validExtensions.includes(extension);
}

/**
 * Gets the storage path for a user's profile photo
 */
export function getProfilePhotoPath(userId: string, extension: string = 'jpg'): string {
  return `${userId}/${userId}.${extension}`;
}

/**
 * Generates a public URL for a profile photo
 */
export function getProfilePhotoUrl(userId: string, extension: string = 'jpg'): string {
  const filePath = getProfilePhotoPath(userId, extension);
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath);
  
  return publicUrl;
}