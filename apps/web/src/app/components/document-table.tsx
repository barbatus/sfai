'use client';

import { ColumnDef, PaginationState } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  File,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useDeleteDocument } from '@/api/documents';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/common/alert-dialog';
import { Button } from '@/components/common/button';
import { toast } from '@/components/common/toaster';
import { DataTable } from '@/components/data-table';
import { getErrorMessage } from '@/lib/error';

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
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return <FileImage className={`${iconClass} text-indigo-500`} />;
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
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const deleteDocumentMutation = useDeleteDocument();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const openDeleteDialog = useCallback((filename: string) => {
    setSelectedFilename(filename);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedFilename) return;

    setDeletingFilename(selectedFilename);

    deleteDocumentMutation.mutate(
      {
        body: {
          filename: selectedFilename,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Document Deleted',
            description: `${selectedFilename} has been successfully deleted`,
            duration: 10000, // 10 seconds
          });
          onDeleteSuccess(selectedFilename);
          setDeletingFilename(null);
          setSelectedFilename(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: getErrorMessage(error, `Failed to delete ${selectedFilename}`),
            variant: 'destructive',
          });
          setDeletingFilename(null);
        },
      },
    );
  }, [deleteDocumentMutation, onDeleteSuccess, selectedFilename]);

  // Transform documents to rows with extension
  const rows: DocumentRow[] = useMemo(
    () =>
      documents.map((filename) => {
        const lastDotIndex = filename.lastIndexOf('.');
        const extension = lastDotIndex > -1 ? filename.slice(lastDotIndex + 1) : '';

        return {
          filename,
          extension,
        };
      }),
    [documents],
  );

  const columns: ColumnDef<DocumentRow>[] = useMemo(
    () => [
      {
        id: 'icon',
        header: '',
        cell: ({ row }) => {
          return <div className="flex justify-center">{getFileIcon(row.original.extension)}</div>;
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'filename',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          const Icon = isSorted === 'asc' ? ArrowUp : isSorted === 'desc' ? ArrowDown : ArrowUpDown;

          const handleSort = () => {
            if (isSorted === false) {
              column.toggleSorting(false); // Set to ascending
            } else if (isSorted === 'asc') {
              column.toggleSorting(true); // Set to descending
            } else {
              column.clearSorting(); // Clear sorting (back to default order)
            }
          };

          // Tooltip text for better UX
          const tooltipText =
            isSorted === 'asc'
              ? 'Sorted A to Z (click for Z to A)'
              : isSorted === 'desc'
                ? 'Sorted Z to A (click for default order)'
                : 'Click to sort A to Z';

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={handleSort}
                className="hover:bg-transparent p-0 font-semibold group"
                title={tooltipText}
              >
                Filename
                <Icon className="ml-2 h-4 w-4" />
              </Button>
              {isSorted !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    column.clearSorting();
                  }}
                  className="h-6 w-6 p-0 hover:bg-transparent hover:text-destructive"
                  title="Clear sorting"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="font-medium truncate pr-4" title={row.original.filename}>
              {row.original.filename}
            </div>
          );
        },
        size: 400,
      },
      {
        accessorKey: 'extension',
        header: () => <div className="text-center">Type</div>,
        cell: ({ row }) => {
          return (
            <div className="uppercase text-sm text-muted-foreground text-center">
              {row.original.extension || 'Unknown'}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const filename = row.original.filename;
          const isDeleting = deletingFilename === filename;

          return (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className="hover:bg-destructive/10 hover:text-destructive"
                onClick={() => openDeleteDialog(filename)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [openDeleteDialog, deletingFilename],
  );

  const isDeleting = deletingFilename === selectedFilename;

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyMessage="No documents uploaded yet"
        showPagination={documents.length > 10}
        pagination={pagination}
        setPagination={setPagination}
      />

      <AlertDialog
        open={!!selectedFilename}
        onOpenChange={(open) => {
          // Only allow closing if not currently deleting
          if (!isDeleting) {
            setSelectedFilename(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedFilename}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
