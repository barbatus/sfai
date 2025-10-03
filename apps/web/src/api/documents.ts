'use client';

import { useQueryClient } from '@tanstack/react-query';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { useCallback } from 'react';
import { documentsContract } from 'ts-rest';

export const documentsApi = initTsrReactQuery(documentsContract, {
  baseUrl: '',
  jsonQuery: true,
});

export const documentsUploadApi = initTsrReactQuery(documentsContract, {
  baseUrl: '',
  jsonQuery: false, // Important: multipart/form-data doesn't use JSON
});

export const useDocuments = () => {
  const queryClient = useQueryClient();

  const result = documentsApi.list.useQuery({
    queryKey: ['documents'],
  });

  const addDocument = useCallback(
    (filename: string) => {
      queryClient.setQueryData(['documents'], (oldData: any) => {
        if (!oldData) {
          return {
            status: 200,
            body: [filename],
            headers: {},
          };
        }

        const currentDocs = Array.isArray(oldData.body) ? oldData.body : [];

        if (currentDocs.includes(filename)) {
          return oldData;
        }

        return {
          ...oldData,
          body: [filename, ...currentDocs],
        };
      });
    },
    [queryClient],
  );

  const removeDocument = useCallback(
    (filename: string) => {
      queryClient.setQueryData(['documents'], (oldData: any) => {
        if (!oldData) return oldData;

        const currentDocs = Array.isArray(oldData.body) ? oldData.body : [];

        return {
          ...oldData,
          body: currentDocs.filter((doc: string) => doc !== filename),
        };
      });
    },
    [queryClient],
  );

  const documents = result.data?.body || [];

  return {
    ...result,
    data: Array.isArray(documents) ? documents : [],
    addDocument,
    removeDocument,
  };
};

export const useDeleteDocument = () => {
  return documentsApi.delete.useMutation();
};

export const uploadDocumentWithProgress = (
  formData: FormData,
  onProgress?: (progress: number) => void,
): Promise<{ status: number; body: any }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({ status: xhr.status, body: response });
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorData.message || errorData.error || `Upload failed with status ${xhr.status}`,
            ),
          );
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', '/api/v1/documents/upload');
    xhr.send(formData);
  });
};

export const useUploadDocumentWithProgress = (onProgress?: (progress: number) => void) => {
  const uploadWithProgress = useCallback(
    async (formData: FormData): Promise<any> => {
      return uploadDocumentWithProgress(formData, onProgress);
    },
    [onProgress],
  );

  return uploadWithProgress;
};

// Keep the old one for compatibility
export const useUploadDocument = () => {
  return documentsUploadApi.upload.useMutation();
};
