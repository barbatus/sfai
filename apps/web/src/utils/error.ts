export function getErrorMessage(
  response: unknown,
  fallbackMessage = 'An unexpected error occurred',
): string {
  if (
    typeof response === 'object' &&
    'error' in response &&
    typeof (response as { error: string }).error === 'string'
  ) {
    const errorResponse = response as { error: string; message?: string };
    return errorResponse.message || errorResponse.error || fallbackMessage;
  }

  if (response instanceof Error) {
    return response.message || fallbackMessage;
  }

  if (typeof response === 'string') {
    return response || fallbackMessage;
  }

  return fallbackMessage;
}
