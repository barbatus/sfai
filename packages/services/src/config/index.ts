import { injectable } from "inversify";

export interface AppConfig {
  adminEmail: string;
  adminPassword: string;
  jwtSecret: string;
  ragApiUrl: string;
  nodeEnv: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceEmail: string;
  supabaseServicePassword: string;
}

export const appConfigSymbol = Symbol.for("AppConfig");

@injectable()
export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      adminEmail: process.env.ADMIN_EMAIL ?? "admin@sfai.com",
      adminPassword: process.env.ADMIN_PASSWORD ?? "SecureAdminPass123!",
      jwtSecret: process.env.JWT_SECRET ?? "sfai-admin-secret-key-2024",
      ragApiUrl:
        process.env.RAG_API_URL ??
        "https://classic-gas-rag-810898639913.us-central1.run.app",
      nodeEnv: process.env.NODE_ENV ?? "development",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      supabaseServiceEmail: process.env.SUPABASE_SERVICE_EMAIL ?? "",
      supabaseServicePassword: process.env.SUPABASE_SERVICE_PASSWORD ?? "",
    };
  }

  getConfig(): AppConfig {
    return this.config;
  }
}

export function getAppConfigStatic(): AppConfig {
  return {
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@sfai.com",
    adminPassword: process.env.ADMIN_PASSWORD ?? "SecureAdminPass123!",
    jwtSecret: process.env.JWT_SECRET ?? "sfai-admin-secret-key-2024",
    ragApiUrl:
      process.env.RAG_API_URL ??
      "https://classic-gas-rag-810898639913.us-central1.run.app",
    nodeEnv: process.env.NODE_ENV ?? "development",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    supabaseServiceEmail: process.env.SUPABASE_SERVICE_EMAIL ?? "",
    supabaseServicePassword: process.env.SUPABASE_SERVICE_PASSWORD ?? "",
  };
}
