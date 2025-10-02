import { z } from "zod";

export const AppConfigEnvSchema = z.object({
  // Admin Panel Authentication
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  RAG_API_URL: z.string().url("RAG_API_URL must be a valid URL"),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_EMAIL: z
    .string()
    .email("SUPABASE_SERVICE_EMAIL must be a valid email"),
  SUPABASE_SERVICE_PASSWORD: z
    .string()
    .min(1, "SUPABASE_SERVICE_PASSWORD is required"),
});

export type AppConfigEnv = z.infer<typeof AppConfigEnvSchema>;

export interface AppConfig {
  adminEmail: string;
  adminPassword: string;
  jwtSecret: string;
  ragApiUrl: string;
  nodeEnv: "development" | "test" | "production";
  supabase: {
    url: string;
    anonKey: string;
    serviceEmail: string;
    servicePassword: string;
  };
}

export function validateConfig(env: Record<string, unknown>): AppConfig {
  try {
    const validated = AppConfigEnvSchema.parse(env);

    return {
      adminEmail: validated.ADMIN_EMAIL,
      adminPassword: validated.ADMIN_PASSWORD,
      jwtSecret: validated.JWT_SECRET,
      ragApiUrl: validated.RAG_API_URL,
      nodeEnv: validated.NODE_ENV,
      supabase: {
        url: validated.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: validated.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceEmail: validated.SUPABASE_SERVICE_EMAIL,
        servicePassword: validated.SUPABASE_SERVICE_PASSWORD,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new Error(`Configuration validation failed:\n${issues}`);
    }
    throw error;
  }
}

let appConfigStatic: AppConfig | undefined;

export function getAppConfigStatic(): AppConfig {
  if (appConfigStatic !== undefined) {
    return appConfigStatic;
  }

  appConfigStatic = validateConfig(process.env);
  return appConfigStatic;
}
