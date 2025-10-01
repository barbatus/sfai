import { injectable } from "inversify";

export interface AppConfig {
  adminEmail: string;
  adminPassword: string;
  jwtSecret: string;
  ragApiUrl: string;
  ragApiToken: string;
  nodeEnv: string;
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
      ragApiToken: process.env.RAG_API_TOKEN ?? "",
      nodeEnv: process.env.NODE_ENV ?? "development",
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
    ragApiToken: process.env.RAG_API_TOKEN ?? "",
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}
