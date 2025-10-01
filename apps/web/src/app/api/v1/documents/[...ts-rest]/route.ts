import { createNextHandler } from '@ts-rest/serverless/next';
import { cookies } from 'next/headers';
import {
  AuthService,
  BadRequestError,
  DocumentsService,
  resolve,
  UnauthorizedError,
} from 'services';
import { documentsContract } from 'ts-rest';

async function verifyAuth(): Promise<boolean> {
  const authService = resolve(AuthService);
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) return false;

  try {
    await authService.verifyToken(token.value);
    return true;
  } catch {
    return false;
  }
}

const handler = createNextHandler(
  documentsContract,
  {
    list: async () => {
      if (!(await verifyAuth())) {
        return {
          status: 401,
          body: {
            error: 'Unauthorized',
            message: 'Not authenticated',
          },
        };
      }

      const documentsService = resolve(DocumentsService);

      try {
        const documents = await documentsService.listDocuments();
        return {
          status: 200,
          body: documents,
        };
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return {
            status: 401,
            body: {
              error: 'Unauthorized',
              message: error.message,
            },
          };
        }

        return {
          status: 500,
          body: {
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Failed to fetch documents',
          },
        };
      }
    },

    // Upload is handled by a separate custom route due to multipart/form-data requirements
    upload: async () => {
      return {
        status: 501,
        body: {
          error: 'Not Implemented',
          message: 'Upload endpoint is handled separately at /api/v1/documents/upload',
        },
      };
    },

    delete: async ({ body }) => {
      if (!(await verifyAuth())) {
        return {
          status: 401,
          body: {
            error: 'Unauthorized',
            message: 'Not authenticated',
          },
        };
      }

      const documentsService = resolve(DocumentsService);

      try {
        const response = await documentsService.deleteDocument(body);
        return {
          status: 200,
          body: response,
        };
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return {
            status: 401,
            body: {
              error: 'Unauthorized',
              message: error.message,
            },
          };
        }

        if (error instanceof BadRequestError) {
          return {
            status: 400,
            body: {
              error: 'Bad Request',
              message: error.message,
            },
          };
        }

        return {
          status: 500,
          body: {
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Failed to delete document',
          },
        };
      }
    },
  },
  {
    handlerType: 'app-router',
    jsonQuery: true,
  },
);

export {
  handler as DELETE,
  handler as GET,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
