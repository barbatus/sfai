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
import { getErrorMessage } from '@/utils';

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
      return <FileImage className={`${iconClass} text-orange-500`} />;
    case 'txt':
      return <FileText className={`${iconClass} text-gray-500`} />;
    case 'json':
    case 'xml':
    case 'html':
      return <FileCode className={`${iconClass} text-purple-500`} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <File className={`${iconClass} text-yellow-500`} />;
    default:
      return <File className={`${iconClass} text-gray-400`} />;
  }
};

export function DocumentTable({ documents, isLoading, onDeleteSuccess }: DocumentTableProps) {
  const [deletingFilename, setDeletingFilename] = useState<string | null>(null);
  const deleteDocumentMutation = useDeleteDocument();

  const handleDelete = async (filename: string) => {
    setDeletingFilename(filename);

    deleteDocumentMutation.mutate(
      {
        body: {
          filename,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: `${filename} deleted successfully`,
          });
          onDeleteSuccess(filename);
          setDeletingFilename(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: getErrorMessage(error, `Failed to delete ${filename}`),
            variant: 'destructive',
          });
          setDeletingFilename(null);
        },
      },
    );
  };

  // Transform documents to rows with extension
  const rows: DocumentRow[] = documents.map((filename) => {
    const lastDotIndex = filename.lastIndexOf('.');
    const extension = lastDotIndex > -1 ? filename.slice(lastDotIndex + 1) : '';

    return {
      filename,
      extension,
    };
  });

  const columns: ColumnDef<DocumentRow>[] = [
    {
      id: 'icon',
      header: '',
      cell: ({ row }) => {
        return <div className="w-8">{getFileIcon(row.original.extension)}</div>;
      },
      size: 40,
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'filename',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Filename
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.filename}</div>;
      },
    },
    {
      accessorKey: 'extension',
      header: 'Type',
      cell: ({ row }) => {
        return (
          <div className="uppercase text-sm text-muted-foreground">
            {row.original.extension || 'Unknown'}
          </div>
        );
      },
      size: 100,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const filename = row.original.filename;
        const isDeleting = deletingFilename === filename;

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
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
                <AlertDialogAction
                  onClick={() => handleDelete(filename)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
      size: 80,
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  return (
    <Space size={4}>
      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyMessage="No documents uploaded yet"
        showPagination={documents.length > 10}
        pageSize={10}
      />
    </Space>
  );
}
