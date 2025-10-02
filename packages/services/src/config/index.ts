import "dotenv/config";

import { injectable } from "inversify";

import { AppConfig, getAppConfigStatic } from "./validation";

export { type AppConfig, getAppConfigStatic } from "./validation";

export const appConfigSymbol = Symbol.for("AppConfig");

@injectable()
export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = getAppConfigStatic();
  }

  getConfig(): AppConfig {
    return this.config;
  }
}
