import { inject, injectable } from "inversify";
import type { DeleteResponse, Document, UploadResponse } from "ts-rest";

import { ConfigService } from "./config";
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
  constructor(@inject(ConfigService) private configService: ConfigService) {}

  async listDocuments(): Promise<string[]> {
    const config = this.configService.getConfig();

    try {
      const response = await fetch(`${config.ragApiUrl}/automotive/documents`, {
        headers: {
          Authorization: `Bearer ${config.ragApiToken}`,
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
    const config = this.configService.getConfig();

    if (file.size > 50 * 1024 * 1024) {
      throw new FileTooLargeError("File exceeds 50MB limit");
    }

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
      const response = await fetch(
        `${config.ragApiUrl}/automotive/upload-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.ragApiToken}`,
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
        throw new InternalServerError(
          `API responded with status ${response.status}`,
        );
      }

      return (await response.json()) as UploadResponse;
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof BadRequestError ||
        error instanceof FileTooLargeError
      ) {
        throw error;
      }
      console.error("Error uploading document:", error);
      throw new InternalServerError("Failed to upload document");
    }
  }

  async deleteDocument(document: Document): Promise<DeleteResponse> {
    const config = this.configService.getConfig();

    try {
      const response = await fetch(
        `${config.ragApiUrl}/automotive/delete_document`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${config.ragApiToken}`,
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
      console.error("Error deleting document:", error);
      throw new InternalServerError("Failed to delete document");
    }
  }
}
