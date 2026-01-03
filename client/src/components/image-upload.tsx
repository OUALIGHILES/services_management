import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { useUploadCategoryImage } from '@/hooks/use-upload-category-image';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  bucketName: string;
  className?: string;
}

export function ImageUpload({ value, onChange, bucketName, className }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage } = useUploadCategoryImage();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);

    try {
      const result = await uploadImage({ image: file });
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        alert(result.error || 'Failed to upload image');
        // Revert preview if upload failed
        setPreviewUrl(value || null);
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      alert(error.message || 'Failed to upload image');
      // Revert preview if upload failed
      setPreviewUrl(value || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          ref={fileInputRef}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Choose Image'}
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>
      
      {previewUrl && (
        <div className="mt-2">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-md border"
          />
        </div>
      )}
      
      {isUploading && (
        <p className="text-sm text-muted-foreground">Uploading image...</p>
      )}
    </div>
  );
}