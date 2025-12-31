import { supabase } from './supabaseClient';
import { randomUUID } from 'crypto';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export interface ImageStorage {
  uploadImage(fileBuffer: Buffer, fileName: string, bucketName: string): Promise<ImageUploadResult>;
  deleteImage(filePath: string, bucketName: string): Promise<boolean>;
  getImageUrl(filePath: string, bucketName: string, expiresIn?: number): Promise<string | null>;
}

// Function to sanitize filename by removing special characters and spaces
export function sanitizeFileName(fileName: string): string {
  // Extract the file extension (if exists)
  const lastDotIndex = fileName.lastIndexOf('.');
  let fileExtension = '';
  let namePart = fileName;

  if (lastDotIndex > 0) {
    fileExtension = fileName.substring(lastDotIndex);
    namePart = fileName.substring(0, lastDotIndex);
  }

  // Replace special characters and spaces with underscores
  const sanitized = namePart
    .replace(/[^\w\s-]/g, '_') // Replace special characters with underscores
    .replace(/\s+/g, '_')      // Replace spaces with underscores
    .replace(/_{2,}/g, '_')    // Replace multiple underscores with single underscore
    .replace(/^_+|_+$/g, '');  // Remove leading/trailing underscores

  return sanitized + fileExtension;
}

export class SupabaseImageStorage implements ImageStorage {
  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    bucketName: string
  ): Promise<ImageUploadResult> {
    try {
      // Sanitize the original filename to remove special characters and spaces
      const sanitizedFileName = sanitizeFileName(fileName);

      // Generate a unique filename to avoid conflicts
      const uniqueFileName = `${Date.now()}-${randomUUID()}-${sanitizedFileName}`;

      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(uniqueFileName, fileBuffer, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(uniqueFileName);

      return {
        success: true,
        url: publicUrlData?.publicUrl,
        fileName: uniqueFileName
      };
    } catch (error) {
      console.error('Unexpected error uploading image:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async deleteImage(filePath: string, bucketName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting image:', error);
      return false;
    }
  }

  async getImageUrl(
    filePath: string, 
    bucketName: string, 
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error getting image URL:', error);
        return null;
      }

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Unexpected error getting image URL:', error);
      return null;
    }
  }
}

// Default instance
export const imageStorage = new SupabaseImageStorage();