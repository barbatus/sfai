'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  File,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { useDeleteDocument } from '@/api/documents';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/common/alert-dialog';
import { Button } from '@/components/common/button';
import { toast } from '@/components/common/toaster';
import { DataTable } from '@/components/data-table';
import { Space } from '@/components/space';

interface DocumentRow {
  filename: string;
  extension: string;
  size?: number;
  uploadedAt?: string;
}

interface DocumentTableProps {
  documents: string[];
  isLoading: boolean;
  onDeleteSuccess: (filename: string) => void;
}

// Get file icon based on extension
const getFileIcon = (extension: string) => {
  const iconClass = 'h-4 w-4';
  switch (extension.toLowerCase()) {
    case 'pdf':
      return <FileText className={`${iconClass} text-red-500`} />;
    case 'docx':
    case 'doc':
      return <FileText className={`${iconClass} text-blue-500`} />;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <FileSpreadsheet className={`${iconClass} text-green-500`} />;
    case 'pptx':
    case 'ppt':
      return <FileText className={`${iconClass} text-orange-500`} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FileImage className={`${iconClass} text-purple-500`} />;
    case 'json':
    case 'xml':
    case 'html':
      return <FileCode className={`${iconClass} text-cyan-500`} />;
    case 'txt':
      return <FileText className={`${iconClass} text-gray-500`} />;
    case 'zip':
      return <File className={`${iconClass} text-yellow-500`} />;
    default:
      return <File className={`${iconClass} text-gray-400`} />;
  }
};

export function DocumentTable({ documents, isLoading, onDeleteSuccess }: DocumentTableProps) {
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const deleteMutation = useDeleteDocument();

  const handleDelete = async (filename: string) => {
    setDeletingFile(filename);
    deleteMutation.mutate(
      { body: { filename } },
      {
        onSuccess: (response) => {
          if (response.status === 200) {
            toast({
              title: 'Success',
              description: `${filename} deleted successfully`,
            });
            onDeleteSuccess(filename);
          } else {
            const errorBody = response.body as { message?: string };
            toast({
              title: 'Error',
              description: errorBody.message || 'Failed to delete document',
              variant: 'destructive',
            });
          }
          setDeletingFile(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to delete document',
            variant: 'destructive',
          });
          setDeletingFile(null);
        },
      },
    );
  };

  // Transform document names to table data
  const data: DocumentRow[] = documents.map((filename) => {
    const lastDotIndex = filename.lastIndexOf('.');
    const extension = lastDotIndex > -1 ? filename.substring(lastDotIndex + 1) : '';
    return {
      filename,
      extension,
    };
  });

  const columns: ColumnDef<DocumentRow>[] = [
    {
      accessorKey: 'icon',
      header: '',
      cell: ({ row }) => getFileIcon(row.original.extension),
      size: 50,
      enableSorting: false,
    },
    {
      accessorKey: 'filename',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Filename
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: 'extension',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const ext = getValue() as string;
        return <span className="uppercase text-xs font-mono">{ext || 'UNKNOWN'}</span>;
      },
      size: 100,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const filename = row.original.filename;
        const isDeleting = deletingFile === filename;

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isDeleting}>
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{filename}&quot;? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(filename)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
      size: 100,
      enableSorting: false,
    },
  ];

  const emptyMessage = (
    <Space size={2}>
      <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
      <h3 className="text-lg font-semibold">No documents uploaded</h3>
      <p className="text-sm text-muted-foreground">Upload your first document to get started</p>
    </Space>
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage={emptyMessage}
      pageSize={10}
      showPagination={true}
      showRowCount={true}
      initialSorting={[{ id: 'filename', desc: false }]}
    />
  );
}
