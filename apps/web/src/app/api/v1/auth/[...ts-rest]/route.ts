import { createNextHandler } from '@ts-rest/serverless/next';
import { cookies } from 'next/headers';
import { AuthService, resolve, UnauthorizedError } from 'services';
import { authContract } from 'ts-rest';

const handler = createNextHandler(
  authContract,
  {
    login: async ({ body }) => {
      const authService = resolve(AuthService);

      try {
        const user = await authService.login(body);
        const token = await authService.createToken(user.email);

        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
          path: '/',
        });

        return {
          status: 200,
          body: user,
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
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },

    logout: async () => {
      const cookieStore = await cookies();
      cookieStore.delete('auth-token');

      return {
        status: 200,
        body: { success: true },
      };
    },

    me: async () => {
      const authService = resolve(AuthService);
      const cookieStore = await cookies();
      const token = cookieStore.get('auth-token');

      if (!token) {
        return {
          status: 401,
          body: {
            error: 'Unauthorized',
            message: 'Not authenticated',
          },
        };
      }

      try {
        const user = await authService.getMe(token.value);
        return {
          status: 200,
          body: user,
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
            message: error instanceof Error ? error.message : 'Unknown error',
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
