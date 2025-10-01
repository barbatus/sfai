import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UserResponseSchema = z.object({
  email: z.string().email(),
  isAuthenticated: z.boolean(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const authContract = c.router(
  {
    login: {
      method: "POST",
      path: "login",
      body: LoginRequestSchema,
      responses: {
        200: UserResponseSchema,
        401: ErrorResponseSchema,
      },
    },
    logout: {
      method: "POST",
      path: "logout",
      body: z.object({}),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    me: {
      method: "GET",
      path: "me",
      responses: {
        200: UserResponseSchema,
        401: ErrorResponseSchema,
      },
    },
  },
  {
    pathPrefix: "/api/v1/auth/",
  },
);
