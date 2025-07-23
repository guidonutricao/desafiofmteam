import { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateImageFile } from '@/lib/validation';
import { compressImage, createImagePreview, revokeImagePreview } from '@/lib/imageUtils';
import { handleError, getErrorMessage } from '@/lib/errorUtils';
import { Camera, Upload, User, X } from 'lucide-react';

interface ProfilePhotoSectionProps {
  currentPhotoUrl?: string;
  userId: string;
  onPhotoUpload: (photoUrl: string) => void;
  uploading?: boolean;
}

export default function ProfilePhotoSection({
  currentPhotoUrl,
  userId,
  onPhotoUpload,
  uploading: externalUploading = false
}: ProfilePhotoSectionProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isUploading = uploading || externalUploading;

  // Store selected file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Arquivo inválido",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    try {
      // Create preview
      const preview = createImagePreview(file);
      setPreviewUrl(preview);
      setSelectedFile(file);
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: "Erro no processamento",
        description: getErrorMessage(appError),
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle upload confirmation
  const handleUploadConfirm = useCallback(async () => {
    if (!selectedFile) return;

    try {
      // Compress image
      const compressedFile = await compressImage(selectedFile, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        outputFormat: 'jpeg'
      });

      // Upload to Supabase Storage
      await uploadPhoto(compressedFile);
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: "Erro no processamento",
        description: getErrorMessage(appError),
        variant: "destructive"
      });
    }
  }, [selectedFile, toast]);

  // Upload photo to Supabase Storage
  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate file name: user_id.extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}.${fileExtension}`;
      const filePath = `avatars/${fileName}`;

      // Delete existing photo if it exists
      if (currentPhotoUrl) {
        const existingPath = currentPhotoUrl.split('/').pop();
        if (existingPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${existingPath}`]);
        }
      }

      // Upload new photo
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update progress
      setUploadProgress(100);

      // Call parent callback
      onPhotoUpload(publicUrl);

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });

      // Clean up preview
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);

    } catch (error) {
      const appError = handleError(error);
      toast({
        title: "Erro no upload",
        description: getErrorMessage(appError),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to select file
  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cancel preview
  const handleCancelPreview = useCallback(() => {
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [previewUrl]);

  // Get display URL (preview or current photo)
  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-amber-500/20 shadow-lg">
          <AvatarImage 
            src={displayUrl} 
            alt="Foto de perfil"
            className="object-cover"
          />
          <AvatarFallback className="bg-zinc-800 text-zinc-100 text-2xl">
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>

        {/* Preview indicator */}
        {previewUrl && (
          <div className="absolute -top-2 -right-2">
            <Button
              size="sm"
              variant="destructive"
              className="h-6 w-6 rounded-full p-0"
              onClick={handleCancelPreview}
              disabled={isUploading}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full max-w-xs">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-zinc-400 text-center mt-1">
            Enviando foto... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 w-full max-w-sm
          transition-colors duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-amber-500 bg-amber-500/10' 
            : 'border-zinc-600 hover:border-amber-500/50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? handleSelectFile : undefined}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-full bg-zinc-800">
            {isDragOver ? (
              <Upload className="w-6 h-6 text-amber-500" />
            ) : (
              <Camera className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-zinc-100">
              {isDragOver ? 'Solte a imagem aqui' : 'Clique ou arraste uma foto'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              JPG, PNG, WEBP até 5MB
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectFile}
          disabled={isUploading}
          className="border-zinc-600 text-zinc-100 hover:bg-zinc-800"
        >
          <Camera className="w-4 h-4 mr-2" />
          Escolher Foto
        </Button>
        
        {previewUrl && (
          <Button
            size="sm"
            onClick={handleUploadConfirm}
            disabled={isUploading}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
          >
            {isUploading ? 'Enviando...' : 'Confirmar Upload'}
          </Button>
        )}
      </div>
    </div>
  );
}