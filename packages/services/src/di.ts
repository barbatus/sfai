import "reflect-metadata";

import { Container, type interfaces } from "inversify";

import { AuthService } from "./auth.service";
import { type AppConfig, appConfigSymbol, getAppConfigStatic } from "./config";
import { ConfigService } from "./config";
import { DocumentsService } from "./documents.service";
import { SupabaseAuthService } from "./supabase-auth.service";

export const container = new Container();

container
  .bind<AppConfig>(appConfigSymbol)
  .toConstantValue(getAppConfigStatic());
container.bind<ConfigService>(ConfigService).toSelf().inSingletonScope();
container.bind<AuthService>(AuthService).toSelf().inSingletonScope();
container
  .bind<SupabaseAuthService>(SupabaseAuthService)
  .toSelf()
  .inSingletonScope();
container.bind<DocumentsService>(DocumentsService).toSelf().inSingletonScope();

export function resolve<T>(service: interfaces.ServiceIdentifier<T>): T {
  return container.get<T>(service);
}

export function getAuthService(): AuthService {
  return container.get<AuthService>(AuthService);
}

export function getDocumentsService(): DocumentsService {
  return container.get<DocumentsService>(DocumentsService);
}

export function getConfigService(): ConfigService {
  return container.get<ConfigService>(ConfigService);
}
