'use client';

import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { Box } from '@/components/box';
import { Button } from '@/components/common/button';
import { Progress } from '@/components/common/progress';
import { ScrollArea } from '@/components/common/scroll-area';
import { Space } from '@/components/space';

export interface FileUploadState {
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

interface UploadStatusProps {
  uploadStates: FileUploadState[];
  onRetry: (state: FileUploadState) => void;
  onClear: () => void;
}

export function UploadStatus({ uploadStates, onRetry, onClear }: UploadStatusProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const hasUploads = uploadStates.length > 0;
  const waitingCount = uploadStates.filter((s) => s.status === 'waiting').length;
  const uploadingCount = uploadStates.filter((s) => s.status === 'uploading').length;
  const completedCount = uploadStates.filter(
    (s) => s.status === 'success' || s.status === 'error',
  ).length;

  const getStatusIcon = useCallback((status: FileUploadState['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary flex-shrink-0" />
        );
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />;
    }
  }, []);

  if (!hasUploads) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-background border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
      <Box
        align="center"
        justify="between"
        className="p-3 border-b-2 border-foreground cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <Box align="center" gap={2}>
          <h4 className="font-semibold text-sm">Upload Progress</h4>
          {(uploadingCount > 0 || waitingCount > 0) && (
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
        </Box>
        <Box align="center" gap={2}>
          {completedCount === uploadStates.length && uploadStates.length > 0 && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6">
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </Box>
      </Box>

      {!isMinimized && (
        <div className="p-3">
          {(waitingCount > 0 || uploadingCount > 0) && (
            <div className="text-xs text-muted-foreground mb-3">
              {uploadingCount > 0 && `Uploading: ${uploadingCount}`}
              {uploadingCount > 0 && waitingCount > 0 && ' | '}
              {waitingCount > 0 && `Waiting: ${waitingCount}`}
            </div>
          )}

          <ScrollArea className="h-[400px] max-h-[50vh]">
            <Space size={2}>
              {uploadStates.map((state) => (
                <div
                  key={state.id}
                  className={`p-3 border border-border rounded-md ${
                    state.status === 'success' ? 'bg-green-50 dark:bg-green-950' : ''
                  } ${state.status === 'error' ? 'bg-red-50 dark:bg-red-950' : ''} ${
                    state.status === 'waiting' ? 'bg-muted/50' : ''
                  }`}
                >
                  <Box align="start" justify="between" className="w-full">
                    <Box align="start" gap={2} className="flex-1 min-w-0">
                      {getStatusIcon(state.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-all">{state.file.name}</p>
                        {state.error && (
                          <p className="text-xs text-red-600 mt-1 break-words">{state.error}</p>
                        )}
                      </div>
                    </Box>
                    {state.status === 'error' && !state.error?.includes('exceeds 50MB') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetry(state);
                        }}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </Box>

                  {state.status === 'uploading' && (
                    <Progress value={state.progress} className="h-1.5 mt-2" />
                  )}

                  {state.status === 'success' && state.response && (
                    <Space size={1} className="text-xs text-muted-foreground mt-2">
                      <Box justify="between">
                        <span>Chunks:</span>
                        <span className="font-mono">{state.response.chunks_created}</span>
                      </Box>
                      <Box justify="between">
                        <span>Time:</span>
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
        </div>
      )}
    </div>
  );
}
