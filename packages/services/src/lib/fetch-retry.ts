export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  maxAttempts = 2,
  delay = 1000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, init);

      if (attempt < maxAttempts && response.status >= 500) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, delay);
        });
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Network error");

      if (attempt < maxAttempts) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, delay);
        });
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error("Failed to fetch");
}
