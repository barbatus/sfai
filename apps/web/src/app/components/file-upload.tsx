'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  FileText,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { useUploadDocument } from '@/api/documents';
import { Box } from '@/components/box';
import { Button } from '@/components/common/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/popover';
import { Progress } from '@/components/common/progress';
import { ScrollArea } from '@/components/common/scroll-area';
import { Space } from '@/components/space';

interface FileUploadState {
  id: string;
  file: File;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  response?: {
    filename: string;
    chunks_created: number;
    vectors_indexed: number;
    processing_time: number;
  };
}

const MAX_PARALLEL_UPLOADS = 10;

export function FileUpload({ onUploadSuccess }: { onUploadSuccess: (filename: string) => void }) {
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);
  const [showProgress, setShowProgress] = useState(true);
  const uploadMutation = useUploadDocument();
  const uploadQueueRef = useRef<FileUploadState[]>([]);
  const activeUploadsRef = useRef<number>(0);
  const processQueueRef = useRef<(() => void) | undefined>(undefined);

  const uploadFile = useCallback(
    async (uploadState: FileUploadState) => {
      const { id, file } = uploadState;

      setUploadStates((prev) =>
        prev.map((state) =>
          state.id === id ? { ...state, status: 'uploading' as const, progress: 0 } : state,
        ),
      );

      const formData = new FormData();
      formData.append('file', file);

      const progressInterval = setInterval(() => {
        setUploadStates((prev) =>
          prev.map((state) =>
            state.id === id && state.status === 'uploading'
              ? { ...state, progress: Math.min(state.progress + 10, 90) }
              : state,
          ),
        );
      }, 200);

      uploadMutation.mutate(
        { body: formData },
        {
          onSuccess: (response) => {
            clearInterval(progressInterval);
            activeUploadsRef.current--;

            if (response.status === 200) {
              setUploadStates((prev) =>
                prev.map((state) =>
                  state.id === id
                    ? {
                        ...state,
                        status: 'success' as const,
                        progress: 100,
                        response: response.body,
                      }
                    : state,
                ),
              );
              onUploadSuccess(response.body.filename);
            } else {
              const errorBody = response.body as { message?: string; error?: string };
              setUploadStates((prev) =>
                prev.map((state) =>
                  state.id === id
                    ? {
                        ...state,
                        status: 'error' as const,
                        error: errorBody.message || errorBody.error || 'Upload failed',
                      }
                    : state,
                ),
              );
            }

            processQueueRef.current?.();
          },
          onError: (error) => {
            clearInterval(progressInterval);
            activeUploadsRef.current--;

            setUploadStates((prev) =>
              prev.map((state) =>
                state.id === id
                  ? {
                      ...state,
                      status: 'error' as const,
                      error: error instanceof Error ? error.message : 'Upload failed',
                    }
                  : state,
              ),
            );

            processQueueRef.current?.();
          },
        },
      );
    },
    [uploadMutation, onUploadSuccess],
  );

  const processUploadQueue = useCallback(async () => {
    while (uploadQueueRef.current.length > 0 && activeUploadsRef.current < MAX_PARALLEL_UPLOADS) {
      const nextUpload = uploadQueueRef.current.shift();
      if (nextUpload) {
        activeUploadsRef.current++;
        uploadFile(nextUpload);
      }
    }
  }, [uploadFile]);

  processQueueRef.current = processUploadQueue;

  const retryUpload = useCallback(
    (state: FileUploadState) => {
      const resetState = { ...state, status: 'waiting' as const, progress: 0, error: undefined };
      setUploadStates((prev) => prev.map((s) => (s.id === state.id ? resetState : s)));
      uploadQueueRef.current.push(resetState);
      processUploadQueue();
    },
    [processUploadQueue],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newUploadStates: FileUploadState[] = acceptedFiles.map((file) => {
        const id = Math.random().toString(36).substring(7);

        if (file.size > 50 * 1024 * 1024) {
          return {
            id,
            file,
            status: 'error' as const,
            progress: 0,
            error: `File exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
          };
        }

        return {
          id,
          file,
          status: 'waiting' as const,
          progress: 0,
        };
      });

      setUploadStates((prev) => [...newUploadStates, ...prev]);

      const validUploads = newUploadStates.filter((state) => state.status === 'waiting');
      uploadQueueRef.current.push(...validUploads);

      setShowProgress(true);
      processUploadQueue();
    },
    [processUploadQueue],
  );

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

  const hasUploads = uploadStates.length > 0;
  const waitingCount = uploadStates.filter((s) => s.status === 'waiting').length;
  const uploadingCount = uploadStates.filter((s) => s.status === 'uploading').length;

  const getStatusIcon = useCallback((status: FileUploadState['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  }, []);

  return (
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

      {hasUploads && (
        <Box justify="end">
          <Popover open={showProgress} onOpenChange={setShowProgress}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                {showProgress ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {(uploadingCount > 0 || waitingCount > 0) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
              <Space size={2}>
                <Box align="center" justify="between">
                  <h4 className="font-semibold text-sm">Upload Progress</h4>
                  {(waitingCount > 0 || uploadingCount > 0) && (
                    <span className="text-xs text-muted-foreground">
                      {uploadingCount > 0 && `Uploading: ${uploadingCount}`}
                      {uploadingCount > 0 && waitingCount > 0 && ' | '}
                      {waitingCount > 0 && `Waiting: ${waitingCount}`}
                    </span>
                  )}
                </Box>
                <ScrollArea className="h-[400px] pr-4">
                  <Space size={3}>
                    {uploadStates.map((state) => (
                      <div
                        key={state.id}
                        className={`
                          p-3 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                          ${state.status === 'success' ? 'bg-green-50 dark:bg-green-950' : ''}
                          ${state.status === 'error' ? 'bg-red-50 dark:bg-red-950' : ''}
                          ${state.status === 'waiting' ? 'bg-gray-50 dark:bg-gray-950' : ''}
                        `}
                      >
                        <Box align="start" justify="between" className="mb-2">
                          <Box align="center" gap={2} className="flex-1 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{state.file.name}</p>
                              {state.error && (
                                <p className="text-xs text-red-600 mt-1">{state.error}</p>
                              )}
                            </div>
                          </Box>
                          <Box align="center" gap={1}>
                            {getStatusIcon(state.status)}
                            {state.status === 'error' && !state.error?.includes('exceeds 50MB') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => retryUpload(state)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </Box>
                        </Box>

                        {state.status === 'uploading' && (
                          <Progress value={state.progress} className="h-2" />
                        )}

                        {state.status === 'success' && state.response && (
                          <Space size={1} className="text-xs text-muted-foreground mt-2">
                            <Box justify="between">
                              <span>Chunks created:</span>
                              <span className="font-mono">{state.response.chunks_created}</span>
                            </Box>
                            <Box justify="between">
                              <span>Vectors indexed:</span>
                              <span className="font-mono">{state.response.vectors_indexed}</span>
                            </Box>
                            <Box justify="between">
                              <span>Processing time:</span>
                              <span className="font-mono">
                                {state.response.processing_time.toFixed(2)}s
                              </span>
                            </Box>
                          </Space>
                        )}
                      </div>
                    ))}
                  </Space>
                </ScrollArea>
              </Space>
            </PopoverContent>
          </Popover>
        </Box>
      )}
    </Space>
  );
}
