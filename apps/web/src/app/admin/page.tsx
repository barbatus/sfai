'use client';

import { FileText, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { useAuth, useLogout } from '@/api/auth';
import { useDocuments } from '@/api/documents';
import { Box } from '@/components/box';
import { Alert, AlertDescription, AlertTitle } from '@/components/common/alert';
import { Button } from '@/components/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card';
import { toast } from '@/components/common/toaster';
import { Space } from '@/components/space';
import { getErrorMessage } from '@/utils';

import { DocumentTable } from '../components/document-table';
import { FileUpload } from '../components/file-upload';

export default function AdminPage() {
  const router = useRouter();
  const { data: authData, isLoading: isAuthLoading, error: authError } = useAuth();
  const {
    data: documents = [],
    isLoading: isLoadingDocs,
    error: documentsError,
    addDocument,
    removeDocument,
  } = useDocuments();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (authError || (authData && !authData.isAuthenticated)) {
      router.push('/login');
    }
  }, [authError, authData, router]);

  const handleLogout = useCallback(() => {
    logoutMutation.mutate(
      { body: {} },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: getErrorMessage(error, 'Failed to logout'),
            variant: 'destructive',
          });
        },
      },
    );
  }, [logoutMutation, router]);

  const handleUploadSuccess = useCallback(
    (filename: string) => {
      addDocument(filename);
    },
    [addDocument],
  );

  const handleDeleteSuccess = useCallback(
    (filename: string) => {
      removeDocument(filename);
    },
    [removeDocument],
  );

  if (isAuthLoading) {
    return (
      <Box align="center" justify="center" className="min-h-screen bg-background">
        <Space size={4} className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </Space>
      </Box>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-4 py-4">
          <Box align="center" justify="between">
            <Box align="center" gap={3}>
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">SFAI Admin Panel</h1>
            </Box>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </Box>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Drag and drop or click to upload files</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Manage your uploaded documents</CardDescription>
              </CardHeader>
              <CardContent>
                {documentsError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error Loading Documents</AlertTitle>
                    <AlertDescription>
                      {getErrorMessage(
                        documentsError,
                        'Failed to load documents. Please try refreshing the page.',
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <DocumentTable
                    documents={documents}
                    isLoading={isLoadingDocs}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
