import { useMutation } from "@tanstack/react-query";

export interface UploadProductImageRequest {
  image: File;
}

export interface UploadProductImageResponse {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async ({ image }: UploadProductImageRequest) => {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch('/api/images/product', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to upload product image');
        } else {
          // If it's not JSON, it might be an HTML redirect/error page
          const text = await response.text();
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            throw new Error('Authentication error - please log in again');
          }
          throw new Error(`Failed to upload product image: ${response.status} ${response.statusText}`);
        }
      }

      return response.json() as Promise<UploadProductImageResponse>;
    },
  });
}