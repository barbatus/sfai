import "reflect-metadata";

import { Container } from "inversify";

import { AuthService } from "./auth.service";
import { type AppConfig, appConfigSymbol, getAppConfigStatic } from "./config";
import { ConfigService } from "./config";
import { DocumentsService } from "./documents.service";

export const container = new Container();

container
  .bind<AppConfig>(appConfigSymbol)
  .toConstantValue(getAppConfigStatic());
container.bind<ConfigService>(ConfigService).toSelf().inSingletonScope();
container.bind<AuthService>(AuthService).toSelf().inSingletonScope();
container.bind<DocumentsService>(DocumentsService).toSelf().inSingletonScope();

// Use a more flexible type for the resolve function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<T>(service: new (...args: any[]) => T): T {
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
