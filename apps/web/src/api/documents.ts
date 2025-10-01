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
    select: (d) => d.body,
  });

  const addDocument = useCallback(
    (filename: string) => {
      queryClient.setQueryData<string[]>(['documents'], (oldData) => {
        if (!oldData) return [filename];
        return [filename, ...oldData];
      });
    },
    [queryClient],
  );

  const removeDocument = useCallback(
    (filename: string) => {
      queryClient.setQueryData<string[]>(['documents'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((doc) => doc !== filename);
      });
    },
    [queryClient],
  );

  return {
    ...result,
    addDocument,
    removeDocument,
  };
};

export const useDeleteDocument = () => {
  return documentsApi.delete.useMutation();
};

export const useUploadDocument = () => {
  return documentsUploadApi.upload.useMutation();
};
