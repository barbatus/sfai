import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  AuthService,
  BadRequestError,
  DocumentsService,
  FileTooLargeError,
  resolve,
  UnauthorizedError,
} from 'services';

export async function POST(request: NextRequest) {
  // Verify authentication
  const authService = resolve(AuthService);
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    await authService.verifyToken(token.value);
  } catch {
    return NextResponse.json({ error: 'Unauthorized', message: 'Invalid token' }, { status: 401 });
  }

  const documentsService = resolve(DocumentsService);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new BadRequestError('No file provided');
    }

    const response = await documentsService.uploadDocument(file);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized', message: error.message }, { status: 401 });
    }

    if (error instanceof BadRequestError) {
      return NextResponse.json({ error: 'Bad Request', message: error.message }, { status: 400 });
    }

    if (error instanceof FileTooLargeError) {
      return NextResponse.json(
        { error: 'File Too Large', message: error.message },
        { status: 413 },
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
