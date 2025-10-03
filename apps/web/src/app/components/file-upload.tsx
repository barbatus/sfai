'use client';

import { ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { uploadDocumentWithProgress } from '@/api/documents';
import { Box } from '@/components/box';
import { Button } from '@/components/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card';
import { FileUploadState, UploadStatus } from '@/components/upload-status';
import { getErrorMessage } from '@/lib/error';

interface FileUploadProps {
  onUploadSuccess?: (filename: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PARALLEL_UPLOADS = 10;

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);

  const uploadQueueRef = useRef<FileUploadState[]>([]);
  const activeUploadsRef = useRef(0);
  const processQueueRef = useRef<(() => void) | undefined>(undefined);

  const uploadFile = useCallback(
    async (uploadState: FileUploadState) => {
      const formData = new FormData();
      formData.append('file', uploadState.file);

      // Mark as uploading with initial progress
      setUploadStates((prev) =>
        prev.map((state) =>
          state.id === uploadState.id
            ? { ...state, status: 'uploading' as const, progress: 0 }
            : state,
        ),
      );

      try {
        const response = await uploadDocumentWithProgress(formData, (percentComplete) => {
          setUploadStates((prev) =>
            prev.map((state) =>
              state.id === uploadState.id
                ? { ...state, status: 'uploading' as const, progress: percentComplete }
                : state,
            ),
          );
        });

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
    [onUploadSuccess],
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
      <Card>
        <div className="cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
          <CardHeader className={isExpanded ? 'pb-4' : 'py-5'}>
            <Box align="center" justify="between">
              <Box align="center" gap={3}>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">File Upload</CardTitle>
                  {!isExpanded && (
                    <CardDescription className="text-sm mt-0.5">
                      Drag and drop to upload • PDF, DOCX, XLSX, TXT, CSV, JSON, HTML, XML, ZIP
                    </CardDescription>
                  )}
                </div>
              </Box>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </Box>
          </CardHeader>
        </div>
        {isExpanded && (
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed border-foreground p-6 text-center cursor-pointer
                transition-all hover:border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                ${isDragActive ? 'bg-primary/10 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              {isDragActive ? (
                <p className="text-primary font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="font-medium mb-1">Drag & drop files here, or click to select</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, XLSX, PPTX, TXT, CSV, JSON, HTML, XML, ZIP • Max 50MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <UploadStatus uploadStates={uploadStates} onRetry={retryUpload} onClear={clearCompleted} />
    </>
  );
}
