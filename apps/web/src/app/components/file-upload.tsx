'use client';

import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { useUploadDocument } from '@/api/documents';
import { Space } from '@/components/space';
import { FileUploadState, UploadStatus } from '@/components/upload-status';
import { getErrorMessage } from '@/utils';

interface FileUploadProps {
  onUploadSuccess?: (filename: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PARALLEL_UPLOADS = 10;

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);
  const uploadMutation = useUploadDocument();

  const uploadQueueRef = useRef<FileUploadState[]>([]);
  const activeUploadsRef = useRef(0);
  const processQueueRef = useRef<(() => void) | undefined>(undefined);

  const uploadFile = useCallback(
    async (uploadState: FileUploadState) => {
      const formData = new FormData();
      formData.append('file', uploadState.file);

      // Mark as uploading
      setUploadStates((prev) =>
        prev.map((state) =>
          state.id === uploadState.id
            ? { ...state, status: 'uploading' as const, progress: 50 }
            : state,
        ),
      );

      try {
        const response = await uploadMutation.mutateAsync({ body: formData });

        if (response.status === 200 && response.body) {
          const body = response.body;

          // Mark as success
          setUploadStates((prev) =>
            prev.map((state) =>
              state.id === uploadState.id
                ? {
                    ...state,
                    status: 'success' as const,
                    progress: 100,
                    response: {
                      filename: body.filename,
                      chunks_created: body.chunks_created,
                      vectors_indexed: body.vectors_indexed,
                      processing_time: body.processing_time,
                    },
                  }
                : state,
            ),
          );

          // Call success callback
          if (onUploadSuccess && body.filename) {
            onUploadSuccess(body.filename);
          }
        } else {
          // Handle non-200 response
          const errorMessage = getErrorMessage(response.body, 'Upload failed');

          setUploadStates((prev) =>
            prev.map((state) =>
              state.id === uploadState.id
                ? {
                    ...state,
                    status: 'error' as const,
                    error: errorMessage,
                  }
                : state,
            ),
          );
        }
      } catch (error) {
        setUploadStates((prev) =>
          prev.map((state) =>
            state.id === uploadState.id
              ? {
                  ...state,
                  status: 'error' as const,
                  error: getErrorMessage(error, 'Upload failed'),
                }
              : state,
          ),
        );
      } finally {
        activeUploadsRef.current--;
        // Call the ref function to process queue
        if (processQueueRef.current) {
          processQueueRef.current();
        }
      }
    },
    [uploadMutation, onUploadSuccess],
  );

  const processUploadQueue = useCallback(async () => {
    while (uploadQueueRef.current.length > 0 && activeUploadsRef.current < MAX_PARALLEL_UPLOADS) {
      const nextUpload = uploadQueueRef.current.shift();
      if (nextUpload) {
        activeUploadsRef.current++;
        // Don't await here to allow parallel uploads
        void uploadFile(nextUpload);
      }
    }
  }, [uploadFile]);

  processQueueRef.current = processUploadQueue;

  const retryUpload = useCallback(
    (uploadState: FileUploadState) => {
      setUploadStates((prev) =>
        prev.map((state) =>
          state.id === uploadState.id
            ? { ...state, status: 'waiting' as const, error: undefined, progress: 0 }
            : state,
        ),
      );

      const retryState = {
        ...uploadState,
        status: 'waiting' as const,
        error: undefined,
        progress: 0,
      };

      uploadQueueRef.current.push(retryState);
      processUploadQueue();
    },
    [processUploadQueue],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newUploadStates: FileUploadState[] = acceptedFiles.map((file) => {
        if (file.size > MAX_FILE_SIZE) {
          return {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            status: 'error' as const,
            progress: 0,
            error: `File "${file.name}" exceeds 50MB limit`,
          };
        }
        return {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          status: 'waiting' as const,
          progress: 0,
        };
      });

      setUploadStates((prev) => [...newUploadStates, ...prev]);

      const validFiles = newUploadStates.filter((state) => state.status === 'waiting');
      uploadQueueRef.current.push(...validFiles);
      processUploadQueue();
    },
    [processUploadQueue],
  );

  const clearCompleted = useCallback(() => {
    setUploadStates((prev) =>
      prev.filter((state) => state.status === 'uploading' || state.status === 'waiting'),
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/html': ['.html'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
      'application/zip': ['.zip'],
    },
  });

  return (
    <>
      <Space size={4}>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed border-foreground p-8 text-center cursor-pointer
            transition-all hover:border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            ${isDragActive ? 'bg-primary/10 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="font-medium mb-2">Drag & drop files here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, XLSX, PPTX, TXT, CSV, JSON, HTML, XML, ZIP
              </p>
              <p className="text-sm text-muted-foreground mt-1">Max 50MB per file</p>
              <p className="text-sm text-muted-foreground">
                All files will be uploaded (10 in parallel)
              </p>
            </div>
          )}
        </div>
      </Space>

      <UploadStatus uploadStates={uploadStates} onRetry={retryUpload} onClear={clearCompleted} />
    </>
  );
}
