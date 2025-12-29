import { useMutation } from "@tanstack/react-query";

export interface UploadDocumentRequest {
  driverId: string;
  documentType: 'license' | 'vehicle_registration' | 'national_id' | 'insurance';
  file: File;
}

export interface UploadDocumentResponse {
  id: string;
  documentUrl: string;
  documentType: string;
  verified: boolean;
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({ driverId, documentType, file }: UploadDocumentRequest) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('driverId', driverId);
      formData.append('documentType', documentType);

      const response = await fetch('/api/drivers/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
      }

      return response.json() as Promise<UploadDocumentResponse>;
    },
  });
}