import { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/lib/validation';
import { createImagePreview, revokeImagePreview } from '@/lib/imageUtils';
import { handleError, getErrorMessage } from '@/lib/errorUtils';
import { useConfirmation } from '@/hooks/use-confirmation';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { uploadProfilePhoto, PhotoUploadProgress } from '@/lib/photoUploadUtils';
import { Camera, Upload, User, X, ImageIcon } from 'lucide-react';
import { announceToScreenReader, KEYBOARD_KEYS } from '@/lib/accessibility';

interface ProfilePhotoSectionProps {
  currentPhotoUrl?: string;
  userId: string;
  onPhotoUpload: (photoUrl: string) => void;
  uploading?: boolean;
}

export function ProfilePhotoSection({
  currentPhotoUrl,
  userId,
  onPhotoUpload,
  uploading: externalUploading = false
}: ProfilePhotoSectionProps) {
  const { toast } = useToast();
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isUploading = uploading || externalUploading;

  // Store selected file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection with enhanced feedback (Requirement 5.3)
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "❌ Arquivo inválido",
        description: `Erro na seleção: ${validation.error}`,
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    try {
      // Create preview
      const preview = createImagePreview(file);
      setPreviewUrl(preview);
      setSelectedFile(file);
      
      // Success feedback for file selection (Requirement 5.1)
      toast({
        title: "📷 Imagem selecionada",
        description: `Arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        duration: 3000
      });
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: "❌ Erro no processamento",
        description: `Falha ao processar imagem: ${getErrorMessage(appError)}`,
        variant: "destructive",
        duration: 5000
      });
    }
  }, [toast]);

  // Upload photo to Supabase Storage (Requirements 2.3, 2.4, 2.5, 7.3)
  const uploadPhoto = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Use the dedicated photo upload utility
      const result = await uploadProfilePhoto(
        file,
        userId,
        currentPhotoUrl,
        {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.8,
          outputFormat: 'jpeg'
        },
        (progress: PhotoUploadProgress) => {
          // Update progress based on stage
          setUploadProgress(progress.progress);
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Call parent callback with new photo URL
      onPhotoUpload(result.photoUrl!);

      // Enhanced success feedback (Requirement 5.2)
      toast({
        title: "✅ Foto de perfil atualizada!",
        description: "Sua nova foto foi salva e já está visível no seu perfil.",
        duration: 4000
      });

      // Clean up preview
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);

    } catch (error) {
      const appError = handleError(error);
      // Enhanced error feedback (Requirement 5.3)
      toast({
        title: "❌ Erro no upload da foto",
        description: `Falha ao enviar imagem: ${getErrorMessage(appError)}`,
        variant: "destructive",
        duration: 6000
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [currentPhotoUrl, userId, onPhotoUpload, previewUrl, toast]);

  // Handle upload confirmation with dialog (Requirement 5.4)
  const handleUploadConfirm = useCallback(async () => {
    if (!selectedFile) return;

    // Show confirmation dialog before uploading (Requirement 5.4)
    const confirmed = await confirm({
      title: "Confirmar upload da foto",
      description: `Deseja definir esta imagem como sua nova foto de perfil? ${currentPhotoUrl ? 'Isso substituirá sua foto atual.' : ''}`,
      confirmText: "Confirmar upload",
      cancelText: "Cancelar"
    });

    if (!confirmed) {
      return;
    }

    try {
      // Upload to Supabase Storage (compression is handled by uploadPhoto)
      await uploadPhoto(selectedFile);
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: "❌ Erro no processamento",
        description: `Falha ao processar imagem: ${getErrorMessage(appError)}`,
        variant: "destructive",
        duration: 5000
      });
    }
  }, [selectedFile, toast, uploadPhoto, confirm, currentPhotoUrl]);

  // Handle drag and drop with accessibility announcements
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    announceToScreenReader('Área de upload ativa. Solte o arquivo para fazer upload.', 'polite');
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
      announceToScreenReader('Arquivo recebido. Processando...', 'polite');
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

  // Handle click to select file with keyboard support
  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle keyboard navigation for upload area
  const handleUploadAreaKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
      e.preventDefault();
      handleSelectFile();
      announceToScreenReader('Abrindo seletor de arquivos', 'polite');
    }
  }, [handleSelectFile]);

  // Cancel preview
  const handleCancelPreview = useCallback(() => {
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [previewUrl]);

  // Enhanced keyboard navigation for the entire component
  const handleComponentKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow escape to cancel preview
    if (e.key === KEYBOARD_KEYS.ESCAPE && previewUrl) {
      e.preventDefault();
      handleCancelPreview();
      announceToScreenReader('Preview cancelado', 'polite');
    }
  }, [previewUrl, handleCancelPreview]);

  // Get display URL (preview or current photo)
  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div 
      className="flex flex-col items-center gap-4"
      onKeyDown={handleComponentKeyDown}
      role="region"
      aria-label="Seção de foto de perfil"
    >
      {/* Avatar Display with comprehensive accessibility */}
      <div 
        className="relative" 
        role="img" 
        aria-label={displayUrl ? "Foto de perfil atual" : "Nenhuma foto de perfil"}
        aria-describedby="avatar-description"
      >
        <Avatar className="h-32 w-32 border-4 border-amber-500/20 shadow-lg">
          <AvatarImage 
            src={displayUrl} 
            alt={displayUrl ? "Foto de perfil do usuário" : ""}
            className="object-cover"
          />
          <AvatarFallback 
            className="bg-zinc-800 text-zinc-100 text-2xl"
            aria-label="Ícone de usuário padrão"
          >
            <User className="w-12 h-12" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
        
        {/* Hidden description for screen readers */}
        <div id="avatar-description" className="sr-only">
          {displayUrl 
            ? previewUrl 
              ? "Preview da nova foto de perfil. Pressione Escape para cancelar ou confirme o upload abaixo."
              : "Foto de perfil atual. Use os controles abaixo para alterar."
            : "Nenhuma foto de perfil definida. Use os controles abaixo para adicionar uma foto."
          }
        </div>

        {/* Preview indicator with accessibility */}
        {previewUrl && (
          <div className="absolute -top-2 -right-2">
            <Button
              size="sm"
              variant="destructive"
              className="h-6 w-6 rounded-full p-0"
              onClick={handleCancelPreview}
              disabled={isUploading}
              aria-label="Cancelar preview da nova foto"
              title="Cancelar preview"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      {/* Upload Progress with accessibility */}
      {isUploading && (
        <div className="w-full max-w-xs" role="status" aria-live="polite">
          <Progress 
            value={uploadProgress} 
            className="h-2"
            aria-label={`Upload progress: ${uploadProgress}%`}
          />
          <p className="text-xs text-zinc-400 text-center mt-1">
            Enviando foto... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Upload Area with comprehensive accessibility */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 w-full max-w-sm
          transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900
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
        onKeyDown={!isUploading ? handleUploadAreaKeyDown : undefined}
        role="button"
        tabIndex={isUploading ? -1 : 0}
        aria-label={
          isDragOver 
            ? "Área de upload ativa. Solte o arquivo para fazer upload."
            : "Área de upload de foto. Clique, pressione Enter ou Space para selecionar arquivo, ou arraste uma imagem aqui."
        }
        aria-describedby="upload-help upload-instructions"
        aria-disabled={isUploading}
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-full bg-zinc-800" aria-hidden="true">
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
            <p id="upload-help" className="text-xs text-zinc-400 mt-1">
              JPG, PNG, WEBP até 5MB
            </p>
            <div id="upload-instructions" className="sr-only">
              Para fazer upload de uma foto: clique nesta área, pressione Enter ou Space para abrir o seletor de arquivos, 
              ou arraste um arquivo de imagem diretamente para esta área. 
              Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5 megabytes.
              {previewUrl && " Pressione Escape para cancelar o preview atual."}
            </div>
          </div>
        </div>

        {/* Hidden file input with proper accessibility */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Action Buttons with comprehensive accessibility */}
      <div className="flex gap-2" role="group" aria-label="Ações da foto de perfil" aria-describedby="actions-help">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectFile}
          disabled={isUploading}
          className="border-zinc-600 text-zinc-100 hover:bg-zinc-800 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          aria-label="Escolher nova foto do dispositivo"
          aria-describedby="choose-photo-help"
        >
          <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
          Escolher Foto
        </Button>
        
        {previewUrl && (
          <Button
            size="sm"
            onClick={handleUploadConfirm}
            disabled={isUploading}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-900 transition-all duration-200 focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            aria-label={isUploading ? "Enviando foto..." : "Confirmar upload da nova foto"}
            aria-describedby="confirm-upload-help"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" aria-hidden="true" />
                Enviando...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                Confirmar Upload
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Hidden help text for screen readers */}
      <div className="sr-only">
        <div id="actions-help">
          Ações disponíveis para gerenciar sua foto de perfil. Use Tab para navegar entre os botões.
        </div>
        <div id="choose-photo-help">
          Abre o seletor de arquivos para escolher uma nova foto do seu dispositivo.
        </div>
        {previewUrl && (
          <div id="confirm-upload-help">
            Confirma o upload da foto selecionada. A foto atual será substituída.
          </div>
        )}
      </div>
      
      {/* Confirmation dialog (Requirement 5.4) */}
      <ConfirmationDialog
        isOpen={isOpen}
        title={options?.title || ''}
        description={options?.description || ''}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        variant={options?.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}