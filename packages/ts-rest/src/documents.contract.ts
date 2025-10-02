import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const DocumentSchema = z.object({
  filename: z.string(),
});

export const UploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  filename: z.string(),
  chunks_created: z.number(),
  vectors_indexed: z.number(),
  processing_time: z.number(),
});

export const DeleteResponseSchema = z.object({
  message: z.string(),
});

export const DocumentErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

export const documentsContract = c.router(
  {
    list: {
      method: "GET",
      path: "list",
      responses: {
        200: z.array(z.string()),
        401: DocumentErrorResponseSchema,
        500: DocumentErrorResponseSchema,
      },
    },
    upload: {
      method: "POST",
      path: "upload",
      contentType: "multipart/form-data",
      body: z.any(), // Using z.any() instead of c.type for multipart data
      responses: {
        200: UploadResponseSchema,
        400: DocumentErrorResponseSchema,
        401: DocumentErrorResponseSchema,
        413: DocumentErrorResponseSchema,
        500: DocumentErrorResponseSchema,
      },
    },
    delete: {
      method: "DELETE",
      path: "delete",
      body: DocumentSchema,
      responses: {
        200: DeleteResponseSchema,
        400: DocumentErrorResponseSchema,
        401: DocumentErrorResponseSchema,
        500: DocumentErrorResponseSchema,
      },
    },
  },
  {
    pathPrefix: "/api/v1/documents/",
  },
);
