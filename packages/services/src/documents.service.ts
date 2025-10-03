import { inject, injectable } from "inversify";
import type { DeleteResponse, Document, UploadResponse } from "ts-rest";

import { ConfigService } from "./config";
import { fetchWithRetry } from "./lib/fetch-retry";
import { SupabaseAuthService } from "./supabase-auth.service";
import {
  BadRequestError,
  FileTooLargeError,
  InternalServerError,
  UnauthorizedError,
} from "./utils/exceptions";

interface FileUpload {
  size: number;
  name: string;
  type?: string;
}

@injectable()
export class DocumentsService {
  constructor(
    @inject(ConfigService) private configService: ConfigService,
    @inject(SupabaseAuthService)
    private supabaseAuthService: SupabaseAuthService,
  ) {
    void this.initializeSupabase();
  }

  private async initializeSupabase(): Promise<void> {
    await this.supabaseAuthService.initialize();
  }

  private async getAuthHeader(): Promise<string> {
    try {
      const token = await this.supabaseAuthService.getAccessToken();
      return `Bearer ${token}`;
    } catch (error) {
      throw new UnauthorizedError("Failed to get authentication token");
    }
  }

  async listDocuments(): Promise<string[]> {
    const config = this.configService.getConfig();
    const authHeader = await this.getAuthHeader();

    try {
      const response = await fetch(`${config.ragApiUrl}/automotive/documents`, {
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new UnauthorizedError("Invalid API token");
        }
        throw new InternalServerError(
          `API responded with status ${response.status}`,
        );
      }

      return (await response.json()) as string[];
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new InternalServerError("Failed to fetch documents");
    }
  }

  async uploadDocument(file: FileUpload | File): Promise<UploadResponse> {
    if (file.size > 50 * 1024 * 1024) {
      throw new FileTooLargeError("File exceeds 50MB limit");
    }

    const config = this.configService.getConfig();
    const authHeader = await this.getAuthHeader();

    // FormData handling for server-side - in production use proper multipart handler
    const FormDataClass =
      typeof FormData !== "undefined"
        ? FormData
        : (global as unknown as { FormData?: typeof FormData }).FormData;

    if (!FormDataClass) {
      throw new InternalServerError(
        "FormData is not available in this environment",
      );
    }

    const formData = new FormDataClass();
    formData.append("file", file as Blob);

    try {
      const response = await fetchWithRetry(
        `${config.ragApiUrl}/automotive/upload-document`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new UnauthorizedError("Invalid API token");
        }
        if (response.status === 400) {
          throw new BadRequestError("Invalid file format");
        }
        if (response.status === 413) {
          throw new FileTooLargeError("File too large");
        }

        throw new InternalServerError("Failed to process document");
      }

      const result = (await response.json()) as UploadResponse;
      return result;
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof BadRequestError ||
        error instanceof FileTooLargeError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      throw new InternalServerError("Failed to process document");
    }
  }

  async deleteDocument(document: Document): Promise<DeleteResponse> {
    const config = this.configService.getConfig();
    const authHeader = await this.getAuthHeader();

    try {
      const response = await fetch(
        `${config.ragApiUrl}/automotive/delete_document`,
        {
          method: "DELETE",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(document),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new UnauthorizedError("Invalid API token");
        }
        if (response.status === 400) {
          throw new BadRequestError("Invalid request");
        }
        throw new InternalServerError(
          `API responded with status ${response.status}`,
        );
      }

      return (await response.json()) as DeleteResponse;
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      throw new InternalServerError("Failed to delete document");
    }
  }
}
