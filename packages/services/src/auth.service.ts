import { inject, injectable } from "inversify";
import { jwtVerify, SignJWT } from "jose";
import type { LoginRequest, UserResponse } from "ts-rest";

import { ConfigService } from "./config";
import { UnauthorizedError } from "./utils/exceptions";

// Standalone function for edge runtime compatibility (no DI container)
export async function verifyToken(
  token: string,
): Promise<{ email: string; isAdmin: boolean }> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new UnauthorizedError("JWT_SECRET not configured");
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { email: string; isAdmin: boolean };
  } catch {
    throw new UnauthorizedError("Invalid token");
  }
}

@injectable()
export class AuthService {
  private secret: Uint8Array;

  constructor(@inject(ConfigService) private configService: ConfigService) {
    const config = this.configService.getConfig();
    this.secret = new TextEncoder().encode(config.jwtSecret);
  }

  async login(credentials: LoginRequest): Promise<UserResponse> {
    const config = this.configService.getConfig();

    if (
      credentials.email !== config.adminEmail ||
      credentials.password !== config.adminPassword
    ) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return {
      email: credentials.email,
      isAuthenticated: true,
    };
  }

  async createToken(email: string): Promise<string> {
    const token = await new SignJWT({ email, isAdmin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(this.secret);

    return token;
  }

  async verifyToken(
    token: string,
  ): Promise<{ email: string; isAdmin: boolean }> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload as { email: string; isAdmin: boolean };
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  }

  async getMe(token: string): Promise<UserResponse> {
    const payload = await this.verifyToken(token);
    return {
      email: payload.email,
      isAuthenticated: true,
    };
  }
}
